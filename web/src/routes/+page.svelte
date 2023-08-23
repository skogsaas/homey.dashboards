<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // Stores
    import { homey, devices, baseUrl, basicFlows, advancedFlows, session, scopes, zones } from '$lib/stores/homey';
    import { items, editing } from '$lib/stores/dashboard';
    import { apiKey } from '$lib/stores/auth';
    
    // UI components
    import Button, { Label, Icon } from '@smui/button';
    import CircularProgress from '@smui/circular-progress';
    import Drawer, {
      AppContent,
      Content,
      Header,
      Title,
      Subtitle,
      Scrim,
    } from '@smui/drawer';
    import TopAppBar, {
      Row,
      Section,
      AutoAdjust,
    } from '@smui/top-app-bar';
    import IconButton from '@smui/icon-button';

    import Dashboard from '$lib/Dashboard.svelte';
    import AddDialog from '$lib/AddDialog.svelte';
    import EditView from '$lib/EditView.svelte';

    // Types
    import type { AdvancedFlow, AppObj, BasicFlow, CapabilityEvent, Homey } from '$lib/types/Homey';
    import type { GridItem } from '$lib/types/Grid';
    import type { WidgetSettings } from '$lib/types/Widgets';
    import { findCreate, findLabel, findMigration } from '$lib/widgets/widgets';
    import { clientId, clientSecret, driverId } from '$lib/constants';

    import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    import { base } from '$app/paths';
    
    let topAppBar: TopAppBar;
    let topAppBarCollapsed: boolean = true;

    let loading: boolean = true;
    let error: any | undefined = undefined;

    let editOpen: boolean = false;
    let editItem: GridItem;

    let addOpen = false;

    onMount(async () => {
      await connectHomey();
      await loadSession();

      await loadDevices();
      await loadFlows();
      await loadZones();
      await loadAppSettings();

      await migrateAppSettings();

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

          homey.set(instance);
        } else {
          const cloudApi = new AthomCloudAPI({
            clientId,
            clientSecret
          });

          const loggedIn = await cloudApi.isLoggedIn();

          if (!loggedIn) {
            await goto(base + '/login');
          } else {
            const user = await cloudApi.getAuthenticatedUser();
            const firstHomey = await user.getFirstHomey();
            const instance = await firstHomey.authenticate();

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

    async function loadAppSettings() {
      let app: AppObj | undefined;
      let result: GridItem[] = [];

      try {
        if($scopes.includes('homey') || $scopes.includes('homey.app')) {
          try {
            app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
          } catch(e) {
            // Do nothing
          }
        }

        if(app !== undefined) {
          result = await app.get({ path: '/dashboards' });
        } else {
          const stored = localStorage.dashboards;

          if(stored !== undefined) {
            result = JSON.parse(stored);
          }
        } 
      } catch (e) {
        error = e;
      } 

      if(result != undefined && Array.isArray(result)) {
        items.set(result);
      }

      loading = false;
    }

    async function saveAppSettings() {
      // Ensure we don't save with the draggable and resizable flags set to true
      toggleEdit();

      let app: AppObj | undefined;

      if($scopes.includes('homey') || $scopes.includes('homey.app')) {
        try {
          app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
        } catch(e) {
          // Do nothing
        }
      }

      if(app !== undefined) {
        await app.put({ path: '/dashboards', body: $items });
      } else {
        localStorage.dashboards = JSON.stringify($items);
      }
    }

    async function migrateAppSettings() {
      const result: GridItem[] = [];
      let changes: boolean = false;

      for(let item of $items) {
        const migration = findMigration(item.settings.type);
        const migrated = migration !== undefined ? migration(item.settings) : item.settings;

        if(migrated !== item.settings) {
          changes = true;
        }

        result.push({ ...item, settings: migrated })
      }

      // If there are any changes after migration, save the app settings.
      if(changes) {
        items.set(result);
        await saveAppSettings();
      }
    }

    async function loadDevices() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.readonly') || $scopes.includes('homey.device.control')) {
          await $homey.devices.connect();
          const d = await $homey.devices.getDevices();
          
          Object.values(d).forEach(async (device) => {
            await device.connect();
            device.on('capability', (event: CapabilityEvent) => devices.onCapability(device.id, event));
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

      items.setEditing($editing);
    }

    function addWidget(type: string) : void {
        if(type === undefined) {
          return;
        }

        const create = findCreate(type);

        if(create !== undefined) {
          const settings = create();
          const item: GridItem = { id: settings?.id, settings };

          editItem = items.addItem(item);
          editOpen = true;
        }
    }

    function editWidget(item: GridItem) : void {
        editItem = item;
        editOpen = true;
    }

    function saveWidget(settings: WidgetSettings) {
      editOpen = false;
      items.setSettings(editItem.id, settings);
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
    <Drawer variant="modal" bind:open={editOpen}>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Editing settings for {findLabel(editItem?.settings?.type)} widget</Subtitle>
      </Header>
      <Content>
        <EditView item={editItem} on:settings={(e) => saveWidget(e.detail)} />
      </Content>
    </Drawer>

    <Scrim />
    <AppContent>

      <TopAppBar bind:this={topAppBar} collapsed={topAppBarCollapsed} dense>
        <Row>
          <Section>
            <IconButton class="material-icons" on:click={() => topAppBarCollapsed = !topAppBarCollapsed}>menu</IconButton>
          </Section>

          {#if !topAppBarCollapsed}
            <Section align="end" toolbar>
              
              {#if !$editing}
                <Button on:click={() => toggleEdit()}>
                  <Icon class="material-icons">settings</Icon>
                  <Label>Edit</Label>
                </Button>
              {:else}
                <Button on:click={() => (addOpen = true)}>
                  <Icon class="material-icons">add</Icon>
                  <Label>Add</Label>
                </Button>

                <Button on:click={() => saveAppSettings()}>
                  <Icon class="material-icons">save</Icon>
                  <Label>Save</Label>
                </Button>
                {/if}
            </Section>
          {/if}
        </Row>
      </TopAppBar>

      {#if !topAppBarCollapsed}
        <AutoAdjust {topAppBar} />
      {/if}

      {#if error !== undefined}
        <div class="error">
          {error}
        </div>
      {/if}
        
      <Dashboard on:edit={e => editWidget(e.detail)} />

      <AddDialog bind:open={addOpen} on:selected={e => addWidget(e.detail)} />
    </AppContent>
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