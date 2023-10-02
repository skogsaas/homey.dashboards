<script lang="ts">
    import './sentry';

    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    // Stores
    import { homey, user, devices, dashboards as homeyDashboards, baseUrl, flowFolders, basicFlows, advancedFlows, session, scopes, zones, insights, homeys } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { dashboard, editing } from '$lib/stores/dashboard';
    import { apiKey } from '$lib/stores/auth';

    // UI components
    import Drawer from "$lib/components/Drawer.svelte";
    import AddDashboardDialog from '$lib/AddDashboardDialog.svelte';
    import IconButton from '$lib/components/IconButton.svelte';

    // Tailwind
    import "../app.postcss";
    import Progress from 'stwui/progress';
    import Button from 'stwui/button';
    import Dropdown from 'stwui/dropdown';
    import List from 'stwui/list';
    import Divider from 'stwui/divider';
    import Toggle from 'stwui/toggle';
    import Media from 'stwui/media';
    import Icon from 'stwui/icon';

    import { mdiCog, mdiMenu, mdiPlus, mdiViewDashboard, mdiViewDashboardEdit, mdiDeathStarVariant } from "$lib/components/icons";

    // Types
    import type { AdvancedFlow, BasicFlow, CapabilityEvent, Homey } from '$lib/types/Homey';
    import type Dashboard from '$lib/types/Dashboard';

    import { clientId, clientSecret } from '$lib/constants';

    import { v4 as uuid } from 'uuid';
    import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';

    let loading: boolean = true;
    let error: any | undefined = undefined;

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards });
    $: fullscreenSupported = document.fullscreenEnabled;

    let menuOpen: boolean = false;
    let toolbarOpen: boolean = false;
    let dashboardMenuOpen: boolean = false;
    let addDashboardOpen: boolean = false;

    onMount(async () => {
      // TODO
      //document.body.setAttribute('data-theme', 'dark');
      await loadData()
    });

    async function loadData() {
      loading = true;

      await connectHomey();

      if($homey !== undefined) {
        await loadSession();

        await loadDevices();
        await loadFlows();
        await loadZones();
        await loadInsights();
      }

      loading = false;
    }

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
            const usr = await cloudApi.getAuthenticatedUser();
            const firstHomey = await usr.getFirstHomey();
            const instance = await firstHomey.authenticate();

            user.set(usr);

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

              if(capability !== undefined) {
                capability.value = event.value;
                capability.lastUpdated = event.transactionTime; 
              }
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
          const folders = await $homey.flow.getFlowFolders();
          const basic = await $homey.flow.getFlows();
          const advanced = await $homey.flow.getAdvancedFlows();

          flowFolders.set(folders);
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
      menuOpen = false;
    }

    async function addDashboard(title: string) : Promise<void> {
      const d: Dashboard = {
        id: uuid(),
        source: 'localstorage',
        title,
        items: []
      };

      localDashboards.update(d);
      
      await goto(base + '/board?id=' + d.id);
    }

    function openDashboard(dash: Dashboard) : Promise<void> {
      menuOpen = false;
      dashboardMenuOpen = false;
      return goto(base + '/board?id=' + dash.id)
    }

    function openDashboardSettings(dash: Dashboard) : Promise<void> {
      menuOpen = false;
      return goto(base + '/board/settings?id=' + dash.id)
    }

    function openAddDashboard() {
      menuOpen = false;
      addDashboardOpen = true;
    }

    async function selectHomey(h: OAuthHomey) {
      const instance = await h.authenticate();

      homey.set(instance);
      dashboard.set(undefined);

      // Navigate to home-screen after switching
      await goto(base + '/');
      menuOpen = false;
    }

</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<div class="w-full h-full text-content">
  {#if loading}
    <div class="w-full">
        <Progress size="xs" indeterminate value={0} />
    </div>
  {:else if $homey !== undefined}
    {#if menuOpen == false && toolbarOpen == false}
      <IconButton data={mdiMenu} on:click={() => menuOpen = true} class="absolute left-0 top-0 z-10 text-primary-content bg-primary rounded-none rounded-br-3xl" size="32px" />
    {/if}

    <AddDashboardDialog bind:open={addDashboardOpen} on:value={(v) => addDashboard(v.detail)} />

    <Drawer bind:open={menuOpen} position="left" size="xs" class="overflow-auto">
      {#if $user !== undefined}
        <Media>
          <Media.Avatar src={$user.avatar.small} />
          <Media.Content>
              <Media.Content.Title>{$user.firstname}</Media.Content.Title>
              <Media.Content.Description>{$user.email}</Media.Content.Description>
          </Media.Content>
        </Media>

        {#if $user.homeys.length > 1}
          <Divider>
            <Divider.Label slot="label">Homeys</Divider.Label>
          </Divider>
          <List>
            {#each $user.homeys as h}
              <List.Item class="pt-2 pb-2 cursor-pointer" on:click={() => selectHomey(h)}>
                <List.Item.Leading slot="leading">
                  <List.Item.Leading.Icon slot="icon" data={mdiDeathStarVariant} />
                </List.Item.Leading>
                <List.Item.Content slot="content">
                  <List.Item.Content.Title slot="title">{h.name}</List.Item.Content.Title>
                </List.Item.Content>
              </List.Item>
            {/each}
          </List>
        {/if}
      {/if}

      <Divider>
        <Divider.Label slot="label">Dashboards</Divider.Label>
      </Divider>
      <List>
        {#each dashboards as d}
          <List.Item class="pt-2 pb-2 cursor-pointer" on:click={() => openDashboard(d)}>
            <List.Item.Leading slot="leading">
              <List.Item.Leading.Icon slot="icon" data={mdiViewDashboard} />
            </List.Item.Leading>
            <List.Item.Content slot="content">
              <List.Item.Content.Title slot="title">{d.title}</List.Item.Content.Title>
            </List.Item.Content>
          </List.Item>
        {/each}
      </List>

      <Divider>
        <Divider.Label slot="label">Tools</Divider.Label>
      </Divider>

      <List>
          {#if $dashboard !== undefined}
            <List.Item class="pt-2 pb-2 cursor-pointer" on:click={() => toggleEdit()}>
              <List.Item.Leading slot="leading">
                <List.Item.Leading.Icon slot="icon" data={mdiViewDashboardEdit} />
              </List.Item.Leading>
              <List.Item.Content slot="content">
                <List.Item.Content.Title slot="title">Edit widgets</List.Item.Content.Title>
              </List.Item.Content>
            </List.Item>

            <List.Item class="pt-2 pb-2 cursor-pointer" on:click={() => openDashboardSettings($dashboard)}>
              <List.Item.Leading slot="leading">
                <List.Item.Leading.Icon slot="icon" data={mdiCog} />
              </List.Item.Leading>
              <List.Item.Content slot="content">
                <List.Item.Content.Title slot="title">Dashboard settings</List.Item.Content.Title>
              </List.Item.Content>
            </List.Item>
          {/if}

          <List.Item class="pt-2 pb-2 cursor-pointer" on:click={() => openAddDashboard()}>
            <List.Item.Leading slot="leading">
              <List.Item.Leading.Icon slot="icon" data={mdiPlus} />
            </List.Item.Leading>
            <List.Item.Content slot="content">
              <List.Item.Content.Title slot="title">Add local dashboard</List.Item.Content.Title>
            </List.Item.Content>
          </List.Item>
      </List>

      <Divider>
        <Divider.Label slot="label"></Divider.Label>
      </Divider>

      <Toggle
        name="toolbarOpen"
        bind:on={toolbarOpen}
      >
        <Toggle.ContentLeft slot="content-left" class="ml-3">
          <Toggle.ContentLeft.Label slot="label">Toolbar open</Toggle.ContentLeft.Label>
        </Toggle.ContentLeft>
      </Toggle>

      {#if fullscreenSupported}
        <Button on:click={() => document.documentElement.requestFullscreen()} class="mt-4">
          Enter fullscreen
        </Button>
      {/if}
    </Drawer>

    {#if toolbarOpen}
      <header class="w-full sticky z-0 drop-shadow-lg p-4 bg-primary flex flex-row">
        <Button on:click={() => menuOpen = true}>
          <Icon slot="icon" data={mdiMenu} />
        </Button>
        
        <Dropdown bind:visible={dashboardMenuOpen}>
          <Button slot="trigger" on:click={() => dashboardMenuOpen = !dashboardMenuOpen}>
            <Button.Icon slot="icon" data={mdiViewDashboard} />
          </Button>
          <Dropdown.Items slot="items">
            {#each dashboards as d}
              {#if $dashboard === undefined || $dashboard.id !== d.id}
                <Dropdown.Items.Item on:click={() => openDashboard(d)} label={d.title} />
              {/if}
            {/each}
          </Dropdown.Items>
        </Dropdown>
        
        {#if $dashboard !== undefined}
          <Button on:click={() => goto(base + '/board?id=' + $dashboard.id)}>{$dashboard.title}</Button>
        {/if}

        <div class="flex flex-grow justify-end">
          <Button on:click={() => (addDashboardOpen = true)}>
            <Button.Icon slot="icon" data={mdiPlus} />
          </Button>

          {#if $dashboard !== undefined}
            <Button on:click={() => toggleEdit()}>
              <Button.Icon slot="icon" data={mdiViewDashboardEdit} />
            </Button>
            <Button on:click={() => goto(base + '/board/settings?id=' + $dashboard.id)}>
              <Button.Icon slot="icon" data={mdiCog} />
            </Button>
          {/if}
        </div>
      </header>
    {/if}
    
    <slot></slot>
  {:else}
    <slot></slot>
  {/if}
</div>