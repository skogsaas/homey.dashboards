<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    // Stores
    import { homey, devices, dashboards as homeyDashboards, baseUrl, basicFlows, advancedFlows, session, scopes, zones, insights, homeys } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { dashboard, editing } from '$lib/stores/dashboard';
    import { apiKey } from '$lib/stores/auth';
    
    // UI components
    import Button, { Icon } from '@smui/button';
    import CircularProgress from '@smui/circular-progress';
    import TopAppBar, {
      Row,
      Section,
      AutoAdjust,
    } from '@smui/top-app-bar';
    import IconButton from '@smui/icon-button';
    import Menu from '@smui/menu';
    import List, { Item, Text } from '@smui/list';

    // Types
    import type { AdvancedFlow, BasicFlow, CapabilityEvent, Homey } from '$lib/types/Homey';
    import type Dashboard from '$lib/types/Dashboard';

    import { clientId, clientSecret } from '$lib/constants';

    import { v4 as uuid } from 'uuid';
    import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    import AddDashboardDialog from '$lib/AddDashboardDialog.svelte';

    let topBar: TopAppBar;
    let topBarCollapsed: boolean = true;

    let loading: boolean = true;
    let error: any | undefined = undefined;

    let dashboardMenu: Menu;
    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards });

    let addDashboardOpen: boolean = false;

    onMount(async () => {
      await connectHomey();

      if($homey !== undefined) {
        await loadSession();

        await loadDevices();
        await loadFlows();
        await loadZones();
        await loadInsights();
      }

      loading = false;
    });

    async function connectHomey() {
      if($homey === undefined) {
        if($apiKey !== undefined) {
          // Local Homey API-key exists
          const instance: Homey = await HomeyAPI.createLocalAPI({
            address: $baseUrl,
            token: $apiKey,
          });

          homeys.add(instance);
          homey.set(instance);
        } else {
          const cloudApi = new AthomCloudAPI({
            clientId,
            clientSecret
          });

          const loggedIn = await cloudApi.isLoggedIn();

          if (loggedIn) {
            const user = await cloudApi.getAuthenticatedUser();
            const firstHomey = await user.getFirstHomey();
            const instance = await firstHomey.authenticate();

            /*
            // TODO:  Create some kind of HomeyManager that is responsible for connecting to an Homey
            //        and reading data from it. Also add `homey` as an parameter to 
            for(const h of homeys) {
              const instance = await h.authenticate();

              homeys.add(instance);
            }
            */

            homeys.add(instance);
            homey.set(instance);
          }
        }
      }
    }

    async function loadSession() {
      try {
        const s = await $homey.sessions.getSessionMe();
        session.set(s);
      } catch (e) {
        error = 'Session: ' + e;
      } 

      loading = false;
    }

    async function loadDevices() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.readonly') || $scopes.includes('homey.device.control')) {
          await $homey.devices.connect();
          const d = await $homey.devices.getDevices();

          $homey.devices.on('device.update', (patch: any) => devices.onDevice(patch));
          
          Object.values(d).forEach(async (device) => {
            await device.connect();
            device.on('capability', (event: CapabilityEvent) => {
              const capability = device.capabilitiesObj[event.capabilityId];
              capability.value = event.value;
              capability.lastUpdated.setUTCMilliseconds(event.transactionTime);
            });
          });

          devices.set(d);
        }
      } catch(e) {
        error = 'Devices: ' + e;
      }
    }

    async function loadFlows() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.flow') || $scopes.includes('homey.flow.readonly') || $scopes.includes('homey.flow.start')) {
          await $homey.flow.connect();
          const basic = await $homey.flow.getFlows();
          const advanced = await $homey.flow.getAdvancedFlows();

          basicFlows.set(basic);
          advancedFlows.set(advanced);

          $homey.flow.on('flow.create', (e: BasicFlow) => basicFlows.onCreate(e));
          $homey.flow.on('flow.delete', (e: BasicFlow) => basicFlows.onDelete(e));
          $homey.flow.on('advancedflow.create', (e: AdvancedFlow) => advancedFlows.onCreate(e));
          $homey.flow.on('advancedflow.delete', (e: AdvancedFlow) => advancedFlows.onDelete(e));
        }
      } catch(e) {
        error = 'Flows: ' + e;
      }
    }

    async function loadInsights() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.insights') || $scopes.includes('homey.insights.readonly')) {
          await $homey.insights.connect();
          const logs = await $homey.insights.getLogs();

          insights.set(logs);

          /*
          $homey.insights.on('log.create', (e: Log) => insights.onCreate(e));
          $homey.insights.on('log.update', (e: Log) => insights.onUpdate(e));
          $homey.insights.on('log.delete', (e: Log) => insights.onDelete(e));
          */
        }
      } catch(e) {
        error = 'Flows: ' + e;
      }
    }

    async function loadZones() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.zone') || $scopes.includes('homey.zone.readonly')) {
          await $homey.zones.connect();
          const z = await $homey.zones.getZones();

          zones.set(z);

          /*
          $homey.zones.on('zone.create', (e: Zone) => zones.onCreate(e));
          $homey.zones.on('zone.delete', (e: Zone) => zones.onDelete(e));
          $homey.zones.on('zone.update', (e: Zone) => zones.onUpdate(e));
          */
        }
      } catch(e) {
        error = 'Zones: ' + e;
      }
    }

    function toggleEdit() {
      editing.toggle();
    }



    function addDashboard(title: string) {
      const d: Dashboard = {
        id: uuid(),
        source: 'localstorage',
        title,
        items: []
      };

      localDashboards.update(d);
    }

</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

{#if loading}
  <div class="loading">
    <CircularProgress style="height: 128px; width: 128px;" indeterminate />
  </div>
{:else}
  {#if $homey !== undefined}
    
      <TopAppBar bind:this={topBar} collapsed={topBarCollapsed} dense>
        <Row>
          <Section>
            <IconButton class="material-icons" on:click={() => topBarCollapsed = !topBarCollapsed}>menu</IconButton>

            {#if !topBarCollapsed}              
              <IconButton class="material-icons" on:click={() => dashboardMenu.setOpen(true)}>dashboard</IconButton>
              <Menu bind:this={dashboardMenu}>
                <List>
                  {#each dashboards as dashboard}
                    <Item on:SMUI:action={() => goto(base + '/board?id=' + dashboard.id)}>
                      <Text>{dashboard.title}</Text>
                    </Item>
                  {/each}
                </List>
              </Menu>

              {#if $dashboard !== undefined}
                <Text>{$dashboard.title}</Text>
              {/if}
            {/if}
          </Section>

          <Section align="end">
            {#if !topBarCollapsed && !$editing}
              <Button on:click={() => toggleEdit()}>
                <Icon class="material-icons">edit</Icon>
                <Text>Edit</Text>
              </Button>
              
              <Button on:click={() => addDashboardOpen = true}>
                <Icon class="material-icons">add</Icon>
                <Text>New</Text>
              </Button>

              <AddDashboardDialog bind:open={addDashboardOpen} on:value={(v) => addDashboard(v.detail)} />
            {/if}
          </Section>
        </Row>
      </TopAppBar>

      {#if !topBarCollapsed}
        <AutoAdjust topAppBar={topBar} />
      {/if}

      {#if error !== undefined}
        <div class="error">
          {error}
        </div>
      {/if}
        
      <slot></slot>
  {/if}
{/if}

<style>

.loading {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  display: flex;
  justify-content: center;
}

</style>