<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // Stores
    import { homey, devices, baseUrl, basicFlows, advancedFlows, session, scopes } from '$lib/stores/homey';
    import { items, editing } from '$lib/stores/dashboard';
    import { apiKey } from '$lib/stores/auth';
    
    // UI components
    import Fab, { Icon } from '@smui/fab';
    import CircularProgress from '@smui/circular-progress';
    import Drawer, {
      AppContent,
      Content,
      Header,
      Title,
      Subtitle,
      Scrim,
    } from '@smui/drawer';

    import Dashboard from '$lib/Dashboard.svelte';
    import AddDialog from '$lib/AddDialog.svelte';
    import EditView from '$lib/EditView.svelte';

    // Types
    import type { AdvancedFlow, BasicFlow, CapabilityEvent } from '$lib/types/Homey';
    import type { GridItem } from '$lib/types/Grid';
    import type { WidgetSettings } from '$lib/types/Widgets';
    import { findLabel } from '$lib/widgets/widgets';

    import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    
    let loading: boolean = true;
    let error: any | undefined = undefined;

    let editOpen: boolean = false;
    let editItem: GridItem;

    let addOpen = false;

    onMount(async () => {
      await connectHomey();
      await loadSession();

      console.log($homey);

      await loadDevices();
      await loadFlows();
      await loadAppSettings();

      loading = false;
    });

    /*
    function tryRefreshAppToken(token: string) {
      if(token !== undefined) {
        const decoded: any = jwtDecode(token);
        const timeout = decoded.exp - Math.floor(Date.now() / 1000);

        if(timeout < 0) {
          let code = $page.url.searchParams.get('code');

          if(code === undefined) {
            loading = false;
            error = 'Token has expired. Login using the Homey app configuration page.'

            appToken.set(undefined);

            return;
          }
        }

        if(timeoutAppToken !== undefined) clearTimeout(timeoutAppToken);
        
        timeoutAppToken = setTimeout(() => {
          tokenApi.getAppToken()
            .then(response => appToken.set(response))
            .catch(e => { loading = false; error = e; });
        }, ((decoded.exp - Math.floor(Date.now() / 1000)) - 600) * 1000);
      }
    }
    */

    async function connectHomey() {
      if($homey === undefined) {
        if($apiKey !== undefined) {
          // Local Homey API-key exists
          const instance = await HomeyAPI.createLocalAPI({
            address: $baseUrl,
            token: $apiKey,
          });

          homey.set(instance);
        } else {
          // Athom OAuth token exists
          const cloudApi = new AthomCloudAPI({
            clientId: '5cbb504da1fc782009f52e46',
            clientSecret: 'gvhs0gebgir8vz8yo2l0jfb49u9xzzhrkuo1uvs8'
          });

          const loggedIn = await cloudApi.isLoggedIn();

          if (!loggedIn) {
            await goto('/login');
          }

          const user = await cloudApi.getAuthenticatedUser();
          const firstHomey = await user.getFirstHomey();
          const instance = await firstHomey.authenticate();

          homey.set(instance);
        }
      }
    }

    async function loadSession() {
      try {
        const s = await $homey.sessions.getSessionMe();
        session.set(s);
      } catch (e) {
        error = e;
      } 

      loading = false;
    }

    async function loadAppSettings() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.app')) {
          // Connect to skogsaas.dashboard app and load stored dashboards Homey Pro

          const app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
          const result: GridItem[] = await app.get({ path: '/dashboards' });

          if(result != undefined && Array.isArray(result)) {
            items.set(result);
          }
        } else {
          const stored = localStorage.dashboards;

          if(stored !== undefined) {
            const result: GridItem[] = JSON.parse(stored);
            items.set(result);
          }
        }        
      } catch (e) {
        error = e;
      } 

      loading = false;
    }

    async function saveAppSettings() {
      // Ensure we don't save with the draggable and resizable flags set to true
      toggleEdit();

      if($scopes.includes('homey') || $scopes.includes('homey.app')) {
        const app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
        await app.put({ path: '/dashboards', body: $items });
      } else {
        localStorage.dashboards = JSON.stringify($items);
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
        error = e;
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
        error = e;
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

        editItem = items.addItem(type);
        editOpen = true;
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
      <div class="container">
        <div class="header">
          {#if $editing}
            <Fab color="secondary" on:click={() => (addOpen = true)}>
              <Icon class="material-icons">add</Icon>
            </Fab>
        
            <Fab color="secondary" on:click={() => saveAppSettings()}>
              <Icon class="material-icons">save</Icon>
            </Fab>
          {/if}
        
          <Fab color="primary" on:click={() => toggleEdit()}>
            <Icon class="material-icons">settings</Icon>
          </Fab>
        </div>

        {#if error !== undefined}
          <div class="error">
            {error}
          </div>
        {/if}
        
        <Dashboard on:edit={e => editWidget(e.detail)} />
        <AddDialog bind:open={addOpen} on:selected={e => addWidget(e.detail)} />
      </div>
    </AppContent>
  {/if}
{/if}

<style>

.container {
  
}

.header {
  position: absolute;
  right: 0px;
  z-index: 6;
}

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