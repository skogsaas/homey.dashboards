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
    import DashboardSettings from './DashboardSettings.svelte';
    import Icon from '$lib/components/Icon.svelte'
    import Widget from '$lib/widgets/Widget.svelte';
    import { mdiCog, mdiFloppy, mdiMenu, mdiWidgets } from '$lib/components/icons';
    import WidgetTypeList from '$lib/components/WidgetTypeList.svelte';

    // Types
    import type { WidgetBreadcrumb, WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { DashboardMap, Dashboard_v2 } from '$lib/types/Dashboard';

    import SectionsInfo from '$lib/widgets/sections';
    import { migrate as migrateDashboard } from '$lib/widgets/migrations';
    
    let widgetsOpen: boolean = false;
    let widgetsDragging: boolean = false;

    let settingsOpen: boolean = false;

    let breadcrumbs: WidgetBreadcrumb[] = [];
    let breadcrumb: WidgetBreadcrumb | undefined;

    let dashboards: DashboardMap;
    let dashboard: Dashboard_v2 | undefined;
    let root: WidgetSettings_v1;

    let migrated: boolean = false;
    let preview: boolean = false;
    let context: WidgetContext;

    $: dashboardId = $page.url.searchParams.get('id');
    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    $: onDashboard(dashboards, dashboardId);

    $: context = { 
        editable: $editing && !preview, 
        readonly: $editing, 
        dashboard: dashboard!,
        breadcrumbs: [],
        select
    };

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
            root = d.root ?? SectionsInfo.create();

            console.log(dashboard);

            currentDashboard.set(d);
        }
    }

    function save() {

    }

    function select(_breadcrumbs: WidgetBreadcrumb[]) {
        breadcrumbs = _breadcrumbs;

        if(breadcrumbs.length > 0) {
            breadcrumb = breadcrumbs[breadcrumbs.length - 1];
        } else {
            breadcrumb = undefined;
        }

        settingsOpen = true;
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
    {:else if $homey !== undefined}
        {#if $editing}
            <div class="w-full h-screen flex flex-col relative">
                <!-- Toolbar -->
                <div class="navbar sticky top-0 z-10 bg-base-200 grow-0">
                    <div class="navbar-start">
                        <label for="main-drawer" aria-label="close sidebar" class="btn btn-square btn-ghost">
                            <Icon data={mdiMenu} />
                        </label>
                        
                        <div class="hidden md:block">
                            <button class="btn btn-ghost text-xl">{dashboard?.title}</button>
                        </div>
                    </div>
                    <div class="navbar-center gap-2">
                        <button class="btn btn-square btn-ghost" on:click={() => { widgetsOpen = !widgetsOpen; }} >
                            <Icon data={mdiWidgets} />
                            Widgets
                        </button>

                        <button class="btn btn-square btn-ghost" on:click={() => { settingsOpen = !settingsOpen }} >
                            <Icon data={mdiCog} />
                            Settings
                        </button>
                    </div>

                    <div class="navbar-end">
                        <div class="join mr-2">
                            <button 
                                class="btn join-item {!preview ? 'btn-primary' : 'btn-outline'}" 
                                on:click={e => (preview = false)}
                            >
                                Editor
                            </button>
                            <button 
                                class="btn join-item {preview ? 'btn-primary' : 'btn-outline'}" 
                                on:click={e => (preview = true)}
                            >
                                Preview
                            </button>
                        </div>

                        <button class="btn btn-square btn-primary" on:click={() => save()} >
                            <Icon data={mdiFloppy} />
                            Save
                        </button>
                    </div>
                </div>

                <!-- Main content -->
                <Widget settings={root} context={context} />

                <!-- Left sidebar -->
                <div class="fixed top-16 left-0 z-10 w-full max-w-xs h-full bg-base-200 transition-transform {!widgetsOpen || widgetsDragging ? '-translate-x-full' : 'translate-x-0'}">
                    <WidgetTypeList on:dragging={e => widgetsDragging = e.detail} />
                </div>

                <!-- Right sidebar -->
                <div class="fixed top-16 right-0 z-10 w-full max-w-xs h-full bg-base-200 transition-transform {!settingsOpen || widgetsDragging ? 'translate-x-full' : 'translate-x-0'}">
                    <DashboardSettings bind:dashboard={dashboard} bind:breadcrumbs={breadcrumbs} bind:breadcrumb={breadcrumb} />
                </div>
            </div>
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
