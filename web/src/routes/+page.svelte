<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    // Stores
    import { homey, devices, baseUrl } from '$lib/stores/homey';
    import { items, editing } from '$lib/stores/dashboard';
    import { appToken, homeyToken } from '$lib/stores/auth';
    
    // UI components
    import Fab, { Icon } from '@smui/fab';
    import CircularProgress from '@smui/circular-progress';

    import Dashboard from '$lib/Dashboard.svelte';
    import AddDialog from '$lib/AddDialog.svelte';
    import EditDialog from '$lib/EditDialog.svelte';

    // Types
    import type { CapabilityEvent } from '$lib/types/Homey';
    import type { GridItem } from '$lib/types/Grid';
    import type { WidgetSettings } from '$lib/types/Widgets';

    // APIs
    import DashboardApi from '$lib/api/DashboardApi';
    import TokenApi from '$lib/api/TokenApi';
    import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
    
    import jwtDecode from 'jwt-decode';
    
    let tokenApi: TokenApi;
    $: tokenApi = new TokenApi($baseUrl as string, $appToken);

    let dashboardApi: DashboardApi;
    $: dashboardApi = new DashboardApi($baseUrl as string, $appToken);

    let timeoutAppToken: number|undefined;
    $: tryRefreshAppToken($appToken);

    let timeoutHomeyToken: number|undefined;
    $: tryRefreshHomeyToken($appToken);
    $: tryConnectHomey($homeyToken);
    
    let loading: boolean = true;
    let error: any | undefined = undefined;

    let editOpen: boolean = false;
    let editItem: GridItem;

    let addOpen = false;

    onMount(async () => {
      await tryCodeLogin();
    });

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

    function tryRefreshHomeyToken(token: string) {
      if(token !== undefined) {
        // If the Homey token is undefined, get the initial token
        if($homeyToken === undefined) {
          tokenApi.getHomeyToken()
            .then(response => homeyToken.set(response))
            .catch(e => { loading = false; error = e; });
        }

        if(timeoutHomeyToken !== undefined) clearTimeout(timeoutHomeyToken);

        timeoutHomeyToken = setTimeout(
          () => {
            tokenApi.getHomeyToken()
              .then(response => homeyToken.set(response))
              .catch(e => { loading = false; error = e; }); 
          }, 
          60*60*24*1000); // Refresh every 24 hours if browser is not restarted
      };
    }

    async function tryCodeLogin() {
      let code = $page.url.searchParams.get('code');
        
      if(code !== null) {
        const t = new TokenApi($baseUrl as string, code);
        const token = await t.getAppToken();
        
        appToken.set(token);

        goto('./', { replaceState: true });
      } else if($appToken === undefined) {
        loading = false;
        error = 'No login-code or token. Login using the Homey app configuration page.'
      }
    }

    async function tryConnectHomey(token: string) {
      if(token !== undefined) {
        const instance = await HomeyAPI.createLocalAPI({
          address: $baseUrl,
          token: token,
        });

        homey.set(instance);

        await loadDevices();
        await loadAppSettings();
      }
    }

    async function loadAppSettings() {
      try {
        const result = await dashboardApi.getItems();

        if(result != undefined && Array.isArray(result)) {
          items.set(result);
        }
      } catch (e) {
        error = e;
      } 

      loading = false;
    }

    async function saveAppSettings() {
      // Ensure we don't save with the draggable and resizable flags set to true
      toggleEdit();

      await dashboardApi.putItems($items);
    }

    async function loadDevices() {
      try {
        await $homey.devices.connect();
        const d = await $homey.devices.getDevices();
        
        Object.values(d).forEach(async (device) => {
          await device.connect();
          device.on('capability', (event: CapabilityEvent) => devices.capabilityUpdate(device.id, event));
        });

        devices.set(d);
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
      items.setSettings(editItem.id, settings);
    }

</script>

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

{#if loading}
  <div class="loading">
    <CircularProgress style="height: 128px; width: 128px;" indeterminate />
  </div>
{/if}

{#if error !== undefined}
  <div class="error">
    {error}
  </div>
{/if}

<Dashboard on:edit={e => editWidget(e.detail)} />
<AddDialog bind:open={addOpen} on:selected={e => addWidget(e.detail)} />
<EditDialog bind:open={editOpen} item={editItem} on:settings={(e) => saveWidget(e.detail)} />

<style>

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