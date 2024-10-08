<script lang="ts">
    import './sentry';
    import { pwaInfo } from 'virtual:pwa-info'; 

    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    // Stores
    import { homey, user, devices, dashboards as homeyDashboards, baseUrl, flowFolders, basicFlows, advancedFlows, session, scopes, zones, insights, homeys, variables, devicesLoading, variablesLoading, flowFoldersLoading, basicFlowsLoading, advancedFlowsLoading, insightsLoading, zonesLoading } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { editing } from '$lib/stores/editing';
    import { apiKey } from '$lib/stores/auth';

    // UI components
    import Icon from '$lib/components/Icon.svelte'

    // Tailwind
    import "../app.css";

    import { mdiCog, mdiMenu, mdiPlus, mdiViewDashboard, mdiViewDashboardEdit, mdiDeathStarVariant, mdiLogout, mdiPostageStamp } from "$lib/components/icons";

    // Types
    import type { AdvancedFlow, BasicFlow, CapabilityEvent, VariableEvent, Homey, OAuthHomey } from '$lib/types/Homey';
    import type { Dashboard_v2 } from '$lib/types/Store';

    import { clientId, clientSecret } from '$lib/constants';

    import { v4 as uuid } from 'uuid';
    import HomeyAPIV3Local from 'homey-api/lib/HomeyAPI/HomeyAPIV3Local';
    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    import { getIcon } from '$lib/components/icons/utils';

    let loading: boolean = true;
    let error: any | undefined = undefined;
    
    let heartbeat: number;
    let heartbeatInterval = 1000;
    let heartbeatClear: any | undefined;

    // Heartbeat logic to check for page frozen
    $: {
        if(heartbeatClear !== undefined) clearInterval(heartbeatClear);

        heartbeatClear = setInterval(() => { heartbeat = Date.now(); }, heartbeatInterval);
    }

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

    async function onWindowVisibilityChange() {      
      if($homey !== undefined && heartbeat < (Date.now() - heartbeatInterval * 2)) {
        console.log('reconnecting');
        
        //$homey.__io.io.engine.close();
        
        await loadData()
      }
    }

    async function loadData() {
      loading = true;

      await connectHomey();

      if($homey !== undefined) {
        await loadSession();

        loadDevices();
        loadVariables();
        loadFlows();
        loadZones();
        loadInsights();
      }

      loading = false;
    }

    async function connectHomey() {
      if($homey === undefined) {
        if($apiKey !== undefined) {
          // Local Homey API-key exists
          const props = {
            token: $apiKey,
            debug: function debug() { },
            baseUrl: $baseUrl,
            strategy: []
          };

          const instance: Homey = new HomeyAPIV3Local(props);

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
        const s = await $homey!.sessions.getSessionMe();
        session.set(s);
      } catch (e) {
        error = 'Session: ' + e;
      } 

      loading = false;
    }

    function loadDevices() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.readonly') || $scopes.includes('homey.device.control')) {
          devicesLoading.set(true);

          $homey!.devices
            .connect()
            .then(() => {
              $homey!.devices
                .getDevices()
                .then(d => {
                  $homey!.devices.on('device.update', (patch: any) => devices.onUpdate(patch));
                
                  Object.values(d).forEach(async (device) => {
                    device
                      .connect()
                      .then(() => {
                        device.on('capability', (event: CapabilityEvent) => {
                          const capability = device.capabilitiesObj[event.capabilityId];

                          if(capability !== undefined) {
                            capability.value = event.value;
                            capability.lastUpdated = event.transactionTime; 
                          }
                        });
                      });
                  });

                  devices.set(d);
                })
                .finally(() => devicesLoading.set(false));
            }, 
            // On error
            () => devicesLoading.set(false));
          }
      } catch(e) {
        error = 'Devices: ' + e;
        devicesLoading.set(false);
      }
    }

    function loadVariables() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.logic') || $scopes.includes('homey.logic.readonly')) {
          variablesLoading.set(true);

          $homey!.logic
            .connect()
            .then(() => {
              $homey!.logic
                .getVariables()
                .then(v => {
                  $homey!.logic.on('variable.update', (event: VariableEvent) => variables.onUpdate(event));
                  variables.set(v);
                })
                .finally(() => variablesLoading.set(false));;
            }, 
            // On error
            () => devicesLoading.set(false));
        }
      } catch(e) {
        error = 'Variables: ' + e;
        variablesLoading.set(false);
      }
    }

    function loadFlows() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.flow') || $scopes.includes('homey.flow.readonly') || $scopes.includes('homey.flow.start')) {
          flowFoldersLoading.set(true);
          basicFlowsLoading.set(true);
          advancedFlowsLoading.set(true);

          $homey!.flow.connect().then(() => {
            $homey!.flow
              .getFlowFolders()
              .then(folders => { flowFolders.set(folders); })
              .finally(() => flowFoldersLoading.set(false));
            $homey!.flow
              .getFlows()
              .then(flows => { basicFlows.set(flows); })
              .finally(() => () => basicFlowsLoading.set(false));
            $homey!.flow
              .getAdvancedFlows()
              .then(flows => { advancedFlows.set(flows); })
              .finally(() => advancedFlowsLoading.set(false));

            $homey!.flow.on('flow.create', (e: BasicFlow) => basicFlows.onCreate(e));
            $homey!.flow.on('flow.delete', (e: BasicFlow) => basicFlows.onDelete(e));
            $homey!.flow.on('advancedflow.create', (e: AdvancedFlow) => advancedFlows.onCreate(e));
            $homey!.flow.on('advancedflow.delete', (e: AdvancedFlow) => advancedFlows.onDelete(e));
          }, () => {
            // On error
            flowFoldersLoading.set(false);
            basicFlowsLoading.set(false);
            advancedFlowsLoading.set(false);
          });
        }
      } catch(e) {
        error = 'Flows: ' + e;

        // On error
        flowFoldersLoading.set(false);
        basicFlowsLoading.set(false);
        advancedFlowsLoading.set(false);
      }
    }

    function loadInsights() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.insights') || $scopes.includes('homey.insights.readonly')) {
          insightsLoading.set(true);

          $homey!.insights
            .connect()
            .then(() => {
              $homey!.insights
                .getLogs()
                .then(logs => { insights.set(logs); })
                .finally(() => insightsLoading.set(false));
            }, 
            // On error
            () => insightsLoading.set(false));

          /*
          $homey.insights.on('log.create', (e: Log) => insights.onCreate(e));
          $homey.insights.on('log.update', (e: Log) => insights.onUpdate(e));
          $homey.insights.on('log.delete', (e: Log) => insights.onDelete(e));
          */
        }
      } catch(e) {
        error = 'Insights: ' + e;
        insightsLoading.set(false);
      }
    }

    function loadZones() {
      try {
        if($scopes.includes('homey') || $scopes.includes('homey.zone') || $scopes.includes('homey.zone.readonly')) {
          zonesLoading.set(true);

          $homey!.zones
            .connect()
            .then(() => {
              $homey!.zones.getZones().then(z => { zones.set(z); });
            })
            .finally(() => zonesLoading.set(false));
          
          /*
          $homey.zones.on('zone.create', (e: Zone) => zones.onCreate(e));
          $homey.zones.on('zone.delete', (e: Zone) => zones.onDelete(e));
          $homey.zones.on('zone.update', (e: Zone) => zones.onUpdate(e));
          */
        }
      } catch(e) {
        error = 'Zones: ' + e;
        zonesLoading.set(false);
      }
    }

    function toggleEdit() {
      editing.toggle();
      menuOpen = false;
    }

    function openDashboard(dash: Dashboard_v2) : Promise<void> {
      menuOpen = false;
      dashboardMenuOpen = false;
      return goto(base + '/board/?id=' + dash.id)
    }

    async function selectHomey(h: OAuthHomey) {
      const instance = await h.authenticate();

      homey.set(instance);

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

      return goto(base + '/');
    }

</script>

<svelte:window on:visibilitychange={e => onWindowVisibilityChange()} />

{#if loading}
  <div class="w-full mt-8 text-center">
    <span class="loading loading-infinity w-40 text-primary"></span>
  </div>
{:else if $homey !== undefined}
  {#if menuOpen == false && toolbarOpen == false && $editing === false}
    <button class="btn btn-circle fixed top-0 z-10" on:click={() => menuOpen = true}>
      <Icon data={mdiMenu} />
    </button>
  {/if}

  <div class="drawer w-full h-full">
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
              {#each dashboards as d}
                <li on:click={() => openDashboard(d)}>
                  <div class="flex items-center">
                    {#if d.iconId !== undefined}
                      <Icon class="w-8 h-8 rounded-full invert" data={getIcon(d.iconId)} />
                    {/if}
                    <div class="flex-1 min-w-0 ml-2">
                      <p class="text-sm font-medium">{d.title}</p>
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
      </div>
    </div>
  </div>
{:else}
  <slot></slot>
{/if}