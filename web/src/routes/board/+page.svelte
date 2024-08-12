<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { dashboardsLoading, homey, dashboards as homeyDashboards } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { editing, dashboard as currentDashboard } from '$lib/stores/dashboard';

    // UI elements
    import WidgetEditor from '$lib/components/WidgetEditor.svelte';
    import DashboardEditor from '$lib/widgets/DashboardEditor.svelte';
    import Widget from '$lib/widgets/Widget.svelte';
    import { mdiViewDashboard } from '$lib/components/icons';

    // Types
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { DashboardMap, Dashboard_v2 } from '$lib/types/Dashboard';

    // Utils
    import { migrate as migrateDashboard } from '$lib/widgets/migrations';
    

    let dashboards: DashboardMap;
    let dashboard: Dashboard_v2 | undefined;
    let root: WidgetSettings_v1 | undefined;

    let migrated: boolean = false;
    let preview: boolean = false;
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

            dashboard = d;
            root = d.root;

            currentDashboard.set(d);
        }
    }

    function onSave() {
        if(dashboard !== undefined) {
            // TODO: Save
        }
    }

    function onRoot(_root: WidgetSettings_v1 | undefined) {
        if(dashboard === undefined) return;

        root = _root;
        dashboard = { ...dashboard, root };
    }
</script>

<div class="w-full h-full">
    {#if $homey === undefined || $dashboardsLoading}
        <div class="flex justify-center">
            <div class="card w-full max-w-md mt-8 bg-base-300">
                <div class="card-body">
                    <h1 class="card-title">🤖 Bzzt!</h1>
                    <p class="py-1">Loading dashboard...</p>
                    <div class="w-full mt-8 text-center">
                        <span class="loading loading-infinity w-40 text-primary"></span>
                    </div>
                </div>
            </div>
        </div>
    {:else if $homey !== undefined && dashboard !== undefined}
        {#if $editing}
            <WidgetEditor
                title={dashboard?.title ?? 'Dashboard title'}
                settingsTitle="Dashboard"
                settingsIcon={mdiViewDashboard}
                root={root}
                on:root={e => onRoot(e.detail)}
                on:save={e => onSave()}
            >
                <DashboardEditor bind:settings={dashboard} />
            </WidgetEditor>
        {:else}
            {#if root !== undefined}
                <Widget settings={root} {context} />
            {:else}
                <div class="flex justify-center">
                    <div class="card w-full max-w-md mt-8 bg-base-300">
                        <div class="card-body">
                            <h1 class="card-title">👋 Hello there!</h1>
                            <p class="py-1">This is a brand new dashboard with no items.</p>
                            
                            <button class="btn" on:click={() => (editing.set(true))}>Edit 🪚</button>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    {/if}
</div>
