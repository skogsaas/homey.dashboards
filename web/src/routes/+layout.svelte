<script lang="ts">
    import './sentry';
    import { pwaInfo } from 'virtual:pwa-info'; 

    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    // Stores
    import { 
      baseUrl, 
      dashboards,
      homey, 
      homeys,
      user
    } from '$lib/stores/homey';
    import { editing } from '$lib/stores/editing';
    import { apiKey, homeyId } from '$lib/stores/auth';

    // UI components
    import Icon from '$lib/components/Icon.svelte'

    // Tailwind
    import "../app.css";

    import { mdiMenu, mdiViewDashboard, mdiViewDashboardEdit, mdiDeathStarVariant, mdiLogout, mdiPostageStamp, mdiMap, mdiInformation } from "$lib/components/icons";

    // Types
    import type { Homey, OAuthHomey } from '$lib/types/Homey';
    import type { Dashboard_v2 } from '$lib/types/Store';

    import { clientId, clientSecret } from '$lib/constants';

    import HomeyAPIV3Local from 'homey-api/lib/HomeyAPI/HomeyAPIV3Local';
    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    import { getIcon } from '$lib/components/icons/utils';
    import { AlertManager } from '$lib/services/AlertManager';
    import { alerts } from '$lib/stores/alerting';
    import { HomeyManager } from '$lib/services/HomeyManager';
    import { version as packageVersion } from '$app/environment';
    import { version } from '$lib/stores/version';

    let homeyManager: HomeyManager | undefined;
    let alertManager: AlertManager = new AlertManager();
    
    let heartbeat: number;
    let heartbeatInterval = 1000;
    let heartbeatClear: any | undefined;

    // Heartbeat logic to check for page frozen
    $: {
        if(heartbeatClear !== undefined) clearInterval(heartbeatClear);

        heartbeatClear = setInterval(() => { heartbeat = Date.now(); }, heartbeatInterval);
    }

    $: notifyVersion();
    $: fullscreenSupported = document.fullscreenEnabled;
    $: connecting = connectHomey();

    let menuOpen: boolean = false;
    let dashboardMenuOpen: boolean = false;

    async function onWindowVisibilityChange() {      
      if($homey !== undefined && heartbeat < (Date.now() - heartbeatInterval * 2)) {
        console.log('reconnecting');
        
        await connectHomey();
      }
    }

    function notifyVersion() {
      const v = $version;

      if(v !== packageVersion) {
        alerts.info('🥰 Upgraded', `The app has been upgraded to ${packageVersion}`, 15000);
        version.set(packageVersion);
      }
    }

    async function connectHomey() : Promise<void> {
      try {
        if($homey === undefined) {
          if($apiKey !== undefined) {
            // Local Homey API-key exists
            const props = {
              token: $apiKey,
              debug: function debug() { },
              baseUrl: $baseUrl,
              strategy: [],
              properties: {
                id: $homeyId
              }
            };

            //const instance = await HomeyAPI.createLocalAPI({
            //  address: $baseUrl,
            //  token: $apiKey,
            //});

            const instance: Homey = new HomeyAPIV3Local(props);
            homeyManager = new HomeyManager(instance);

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

              homeyManager = new HomeyManager(instance);
              
              user.set(usr);

              homeys.add(instance);
              homey.set(instance);
            }
          }
        }

        if(homeyManager !== undefined) {
          await homeyManager.loadAsync();
        } 
      } catch(error) {
        alerts.error('Error!', 'Error while connecting: ' + error, 10000);
      }
    }

    function toggleEdit() {
      editing.toggle();
      menuOpen = false;
    }

    function openDashboard(dash: Dashboard_v2) : Promise<void> {
      menuOpen = false;
      dashboardMenuOpen = false;
      return goto(base + '/board/?id=' + dash.id);
    }

    async function selectHomey(h: OAuthHomey) {
      const instance = await h.authenticate();

      homey.set(instance);
      homeyManager = new HomeyManager(instance);
      await homeyManager.loadAsync();

      // Navigate to home-screen after switching
      await goto(base + '/');
      menuOpen = true;
    }

    async function logout() {
      if($apiKey !== undefined) {
        apiKey.set(undefined);
      } else {
        const cloudApi = new AthomCloudAPI({
            clientId,
            clientSecret
        });

        await cloudApi.logout();
      }

      homey.set(undefined);
      homeyManager?.destroy();

      return goto(base + '/');
    }

</script>

<svelte:window on:visibilitychange={e => onWindowVisibilityChange()} />

{#await connecting}
  <div class="flex justify-center m-2">
    <div class="card w-full max-w-md mt-8 bg-base-300">
        <div class="card-body">
            <h1 class="card-title">Bzzt! 🛸</h1>
            <p class="py-1">Beaming down to your Homey! 👽</p>
            <div class="w-full mt-8 text-center">
                <span class="loading loading-infinity w-40 text-primary"></span>
            </div>
        </div>
    </div>
  </div>
{:then _loaded} 
  {#if $homey !== undefined}
    {#if menuOpen === false && $editing === false}
      <div class="btm-nav btm-nav-md bg-base-300 md:hidden z-10">
        <button on:click={e => menuOpen = !menuOpen}>
          <Icon data={mdiMenu} />
          <span class="btm-nav-label">Menu</span>
        </button>

        <button disabled>
          <Icon data={mdiMap} />
          <span class="btm-nav-label">Explore</span>
        </button>
        
        <button class="dropdown dropdown-top dropdown-end">
          <button tabindex="0"><Icon data={mdiViewDashboard} /><span class="btm-nav-label block">Dashboards</span></button>
          <ul
            tabindex="0"
            class="dropdown-content menu menu-lg bg-base-300 rounded-box my-2 gap-1 w-72 p-2 shadow"
          >
            {#each Object.values($dashboards) as dashboard}
              <li>
                <a href="{base + '/board/?id=' + dashboard.id}" class="overflow-hidden overflow-ellipsis">
                  {#if dashboard.iconId !== undefined}
                    <Icon data={getIcon(dashboard.iconId)} />
                  {/if}
                  <span>{dashboard.title}</span>
                </a>
              </li>
            {/each}
          </ul>
        </button>
        
      </div>
      
      <button class="btn btn-circle fixed top-0 z-10 hidden md:block" on:click={() => menuOpen = true}>
        <Icon data={mdiMenu} />
      </button>

      <div class="fixed bottom-20 md:bottom-1 right-1 z-50 flex flex-col gap-2">
        {#each $alerts as alert}
          <div class="alert shadow-lg {alert.classes}">
            {#if alert.icon !== undefined}
              <Icon data={getIcon(alert.icon)} />
            {/if}
            <div class="w-40">
              <span class="font-bold">{alert.title}</span>
              <div class="text-sm">{alert.text}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="drawer w-full h-full relative">
      <input id="main-drawer" type="checkbox" class="drawer-toggle" bind:checked={menuOpen} />
      
      <div class="drawer-content">
        <slot></slot>
      </div>

      <div class="drawer-side">
        <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label>

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div class="w-full max-w-xs min-h-full bg-base-200">
          <ul class="menu w-full">
            <!-- Support for multiple Homeys -->
            {#if $user !== undefined}
              <li class="flex items-center cursor-pointer">
                <div class="avatar">
                  <img class="w-24 mask mask-circle" src={$user.avatar.small} alt={$user.fullname} />
                </div>
                <div class="space-y-1 font-medium">
                  <div>{$user.firstname}</div>
                  <div class="text-sm">{$user.email}</div>
                </div>
              </li>

              {#if $user.homeys.length > 1}
                <li>
                  <a>Homeys</a>
                  <ul>
                    {#each $user.homeys as h}
                      <li on:click={() => selectHomey(h)}>
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <Icon class="w-8 h-8 rounded-full invert" data={mdiDeathStarVariant} />
                          </div>
                          <div class="flex-1 min-w-0 ml-2">
                            <p class="text-sm font-medium">{h.name}</p>
                            <p class="text-sm capitalize">{h.modelName}</p>
                          </div>
                        </div>
                      </li>
                    {/each}
                  </ul>
                </li>
              {/if}
            {/if}

            <li on:click={_ => goto(base + '/board/')}>
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Icon class="w-8 h-8 rounded-full invert" data={mdiViewDashboard} />
                </div>
                <div class="flex-1 min-w-0 ml-2">
                  <p class="text-sm font-medium">Dashboards</p>
                </div>
              </div>
              
              <ul>
                {#each Object.values($dashboards) as dashboard}
                  <li on:click|stopPropagation={() => openDashboard(dashboard)}>
                    <div class="flex items-center">
                      {#if dashboard.iconId !== undefined}
                        <Icon class="w-8 h-8 rounded-full invert" data={getIcon(dashboard.iconId)} />
                      {/if}
                      <div class="flex-1 min-w-0 ml-2">
                        <p class="text-sm font-medium">{dashboard.title}</p>
                      </div>
                    </div>
                  </li>
                {/each}
              </ul>
            </li>

            <li on:click={_ => goto(base + '/template/')}>
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Icon class="w-8 h-8 rounded-full invert" data={mdiPostageStamp} />
                </div>
                <div class="flex-1 min-w-0 ml-2">
                  <p class="text-sm font-medium">Templates</p>
                </div>
              </div>
            </li>

            <li on:click={() => toggleEdit()}>
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Icon class="w-8 h-8 rounded-full invert" data={mdiViewDashboardEdit} />
                </div>
                <div class="flex-1 min-w-0 ml-2">
                  <p class="text-sm font-medium">Edit dashboard</p>
                </div>
              </div>
            </li>

            <li on:click={() => logout()}>
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Icon class="w-8 h-8 rounded-full invert" data={mdiLogout} />
                </div>
                <div class="flex-1 min-w-0 ml-2">
                  <p class="text-sm font-medium">Logout</p>
                </div>
              </div>
            </li>
          </ul>

          <div class="text-sm m-8">Version: {packageVersion}</div>
        </div>
      </div>
    </div>
  {:else}
    <slot></slot>
  {/if}
{:catch _error}
  <div class="flex justify-center m-2">
    <div class="card w-full max-w-md mt-8 bg-base-300">
        <div class="card-body">
            <h1 class="card-title">Au! 🤯</h1>
            <p class="py-1">Something went wrong while connecting 🤕</p>
            <div class="w-full mt-8 text-center">
                {_error}
            </div>
        </div>
    </div>
  </div>
{/await}