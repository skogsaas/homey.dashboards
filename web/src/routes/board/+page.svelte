<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { homey, dashboards as homeyDashboards, stores } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { editing } from '$lib/stores/editing';

    // UI elements
    import WidgetEditor from '$lib/components/WidgetEditor.svelte';
    import DashboardEditor from './DashboardEditor.svelte';
    import Widget from '$lib/widgets/Widget.svelte';
    import { mdiViewDashboard } from '$lib/components/icons';
    import StoreDialog from '$lib/components/StoreDialog.svelte';

    // Types
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { DashboardMap, Dashboard_v2 } from '$lib/types/Store';

    // Utils
    import { migrate as migrateDashboard } from '$lib/widgets/migrations';
    import { deleteDashboard, saveDashboard } from '$lib/api/webhook';
    import { v4 as uuid } from 'uuid';
    import DashboardListHero from '$lib/components/DashboardListHero.svelte';
    import { alerts } from '$lib/stores/alerting';
    
    let dashboards: DashboardMap;
    let dashboard: Dashboard_v2 | undefined;
    let root: WidgetSettings_v1 | undefined;

    let storeOpen: boolean = false;

    let migrated: boolean = false;
    let context: WidgetContext;

    $: dashboardId = $page.url.searchParams.get('id');
    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    $: onDashboard(dashboards, dashboardId);

    $: context = {
        editable: false,
        readonly: false,
        breadcrumbs: [],
        select: () => {},
    }

    onMount(async () => {
        if($homey === undefined) { // Not logged in
            await goto(base + '/');
        }
    });

    function onDashboard(_dashboards: DashboardMap, _dashboardId: string | null) {
        const _dashboard = dashboards[_dashboardId ?? ''];
        
        if(_dashboard !== undefined && (dashboard === undefined || (dashboard !== _dashboard && !$editing))) {
            const d = migrateDashboard(_dashboard);
            migrated = d !== _dashboard;

            if(migrated) {
                alerts.plain('Tip!', 'This dashboard has been updated to a newer version. If everything looks good, coinsider saving the dashboard.', 10000);
            }

            dashboard = d;
            root = d.root;
        } else if(_dashboardId === null) {
            dashboard = undefined;
            root = undefined;
        }
    }

    async function onSave() {
        if(dashboard !== undefined) {
            const storeId = Object.values($stores).find(store => store.dashboards.some(dash => dash?.id === dashboard?.id))?.id;

            if(storeId !== undefined) {
                try {
                    await saveDashboard($homey!.id, storeId, dashboard);
                    alerts.success('Saved!', 'The dashboard was saved.', 5000);

                    editing.set(false);
                } catch(error) {
                    alerts.error('Error!', 'Could not save dashboard: ' + error, 10000);
                }
            } else {
                // This is a new dashboard, need to select a store first.
                storeOpen = true;
            }
        }
    }

    async function onStoreSelect(storeId: string) {        
        try {
            await saveDashboard($homey!.id, storeId, dashboard!);
            alerts.success('Saved!', 'The dashboard was saved.', 5000);
            
            editing.set(false);
        } catch(error) {
            alerts.error('Error!', 'Could not save dashboard: ' + error, 10000);
        }
    }

    async function onDelete() {
        if(dashboard !== undefined) {
            const storeId = Object.values($stores).find(store => store.dashboards.some(dash => dash?.id === dashboard?.id))?.id;

            if(storeId !== undefined) {
                try {
                    await deleteDashboard($homey!.id, storeId, dashboard);
                    await goto(base + '/board/');
                } catch(error) {
                    alerts.error('Error!', 'Could not delete dashboard: ' + error, 10000);
                }
            } else {
                alerts.error('Error!', 'Could not find store for dashboard', 10000);
            }
        }
    }

    function onSettings(_dashboard: Dashboard_v2) {
        dashboard = { ..._dashboard, root };
    }

    function onRoot(_root: WidgetSettings_v1 | undefined) {
        if(dashboard === undefined) return;

        root = _root;
        dashboard = { ...dashboard, root };
    }

    function create() {
        dashboard = {
            id: uuid(),
            version: 2,
            title: 'New dashboard',
            root: undefined,
            theme: undefined
        }

        root = dashboard.root;
        editing.set(true);
    }
</script>

<svelte:head>
  <title>{dashboard !== undefined ? dashboard.title : 'Dashboard'}</title>
</svelte:head>

<div class="w-full h-full pb-16 md:pb-0" data-theme={dashboard?.theme ?? ''}>
    {#if $editing && dashboard !== undefined}
        <WidgetEditor
            title={dashboard?.title ?? 'Dashboard title'}
            settingsTitle="Dashboard"
            settingsIcon={mdiViewDashboard}
            root={root}
            on:root={e => onRoot(e.detail)}
            on:save={e => onSave()}
        >
            <DashboardEditor settings={dashboard} on:settings={e => onSettings(e.detail)} on:delete={e => onDelete()} />
        </WidgetEditor>

        <StoreDialog bind:open={storeOpen} on:storeId={e => onStoreSelect(e.detail)} />
    {:else if root !== undefined}
        <div class="p-2">
            <Widget settings={root} {context} />
        </div>
    {:else}
        <div class="flex min-h-screen justify-center">
            <DashboardListHero>
                <div class="p-4">
                    {#if dashboard !== undefined}
                        <h1 class="text-5xl font-bold">🤷 Empty!</h1>
                        <p class="py-6">This dashboard is empty.</p>

                        <button class="btn btn-primary" on:click={() => (editing.set(true))}>Edit 🪚</button>
                    {:else if dashboardId !== null}
                        <h1 class="text-5xl font-bold">🤖 Does not compute!</h1>
                        <p class="py-6">
                            Cannot find the dashboard with id: <code>{dashboardId}</code>
                        </p>
                        
                        <div class="w-full mt-8 text-center">
                            <span class="text-5xl">🤷</span>
                        </div>
                    {:else}
                        <h1 class="text-5xl font-bold">👋 Hello there!</h1>
                        <p class="py-6">Want to create a new dashboard?</p>
                        
                        <div class="w-full text-center">
                            <button class="btn btn-primary" on:click={() => create()}>Hell yeah! 🎸</button>
                        </div>
                    {/if}
                </div>
            </DashboardListHero>
        </div>
    {/if}
</div>
