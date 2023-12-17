<script lang="ts">
    // Svelte
    import { onMount, type ComponentType, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { devices, homey, dashboards as homeyDashboards, scopes } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { editing, dashboard as currentDashboard } from '$lib/stores/dashboard';
    
    // UI components
    import AddWidgetDialog from '$lib/AddWidgetDialog.svelte';
    import EditWidgetView from '$lib/EditWidgetView.svelte';

    // Tailwind
    import Portal from "stwui/portal";
    import Modal from "stwui/modal";
    import Button from "stwui/button";
    import Icon from "stwui/icon";

    // Types
    import type { GridItem_v1, GridLayoutItem_v1, GridLayout_v1 } from '$lib/types/Grid';
    import type { WidgetContext, WidgetSettings, WidgetSettingsMap } from '$lib/types/Widgets';
    import { findMigration, findWidget, widgets as widgetTypes, type WidgetInfo, findCreate, findEditor } from '$lib/widgets';
    import type { DashboardMap, Dashboard_v2 } from '$lib/types/Dashboard';
    
    import Widget from '$lib/widgets/Widget.svelte';

    import { v4 as uuid } from 'uuid';

    import { webhookId, webhookUrl } from '$lib/constants';

    import { migrate, migrate as migrateGridItem } from '$lib/widgets/migrations';
    import IconButton from '$lib/components/IconButton.svelte';
    import { mdiAppsBox, mdiArrowLeft, mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiClose, mdiCloseCircle, mdiCog, mdiSettingsHelper, mdiWidgets } from '$lib/components/icons';
    import Grid from '$lib/components/grid/Grid.svelte';
    import Drawer from '$lib/components/Drawer.svelte';
    import { CalculatePosition } from '$lib/components/grid/GridUtils';
    import { Divider } from 'stwui';

    let layout: GridLayout_v1 | undefined;
    let items: GridLayoutItem_v1[] | undefined;
    let widgets: WidgetSettingsMap | undefined;

    let editOpen: boolean = false;
    let editItem: WidgetSettings | undefined;

    let widgetsOpen: boolean = true;

    let dashboards: DashboardMap;
    let dashboard: Dashboard_v2 | undefined;

    $: dashboardId = $page.url.searchParams.get('id');

    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    $: dashboard = dashboardId !== null ? dashboards[dashboardId] : undefined;

    $: onDashboard(dashboard);

    onMount(async () => {
        if($homey === undefined) { // Not logged in
            await goto(base + '/');
        }
    });

    function onDashboard(_dashboard: Dashboard_v2 | undefined)
    {
        layout = { columns: 24, rowHeight: 48, breakpoint: 0, items: [] };
        items = layout?.items ?? [];
        widgets = _dashboard?.widgets ?? {};

        console.log("dashboard");
    }

    function selectWidget(id: any) {
        if(widgets !== undefined) {
            editItem = widgets[id];
        }
    }

    function getWidget(id: any) : WidgetSettings {
        if(widgets === undefined) return { id, type: 'unknown', version: 1 };

        return widgets[id];
    }

    function addWidget(info: WidgetInfo, e: any) {
        var create = findCreate(info.type);

        if(create !== undefined && layout !== undefined && widgets !== undefined) {
            const widget = create();
            const item = { id: widget.id, x: layout.columns / 2, y: 0, w: 2, h: 2 };

            items = [...(items ?? []), item];
            widgets[widget.id] = widget;
        }
    }

    function updateWidget(widget: WidgetSettings) {
        const copy = { ...widgets };
        copy[widget.id] = widget;

        widgets = copy;
        items = [...items ?? []]; // Force reload
    }

    function addContainer() {
        if(layout !== undefined && widgets !== undefined) {
            const id = uuid();
            const item = { id, x: layout.columns / 2, y: 0, w: 4, h: 4, container: true, children: [] };

            items = [...(items ?? []), item];
            widgets[id] = { id, type: 'unknown', version: 1 };
        }
    }

</script>

    {#if $homey !== undefined}
        <Drawer bind:open={widgetsOpen} position="left" size="15rem">
            <div class="p-2">
                <div class="w-full">
                    <h1 class="w-full text-center">Widgets</h1>
                    <IconButton 
                        class="absolute top-1 -right-7"
                        data={mdiChevronDoubleLeft} 
                        size="48px" 
                        on:click={() => widgetsOpen = false} 
                    />
                </div>

                <Divider>
                    <Divider.Label slot="label"></Divider.Label>
                </Divider>

                <div class="flex flex-row items-center m-2 hover:bg-primary-hover rounded-md" on:pointerdown|stopPropagation={e => addContainer()}>
                    <Icon data={mdiAppsBox} size="48" />
                    <span class="ml-4">Container</span>
                </div>

                <Divider>
                    <Divider.Label slot="label"></Divider.Label>
                </Divider>

                {#each widgetTypes as widget}
                    <div class="flex flex-row items-center m-2 hover:bg-primary-hover rounded-md" on:pointerdown|stopPropagation={e => addWidget(widget, e.detail)}>
                        <Icon data={widget.icon} size="48" />
                        <span class="ml-4">{widget.label}</span>
                    </div>
                {/each}
            </div>
        </Drawer>

        {#if !widgetsOpen}
            <div class="fixed z-10" style="top:calc(100vh/2 - 48px/2);left:0px;">
                <IconButton 
                    data={mdiWidgets} 
                    size="48px" 
                    on:click={() => widgetsOpen = true} 
                />
            </div>
        {/if}

        <Drawer bind:open={editOpen} position="right" size="20rem">
            <div class="p-2">
                <div class="w-full">
                    <h1 class="w-full text-center">Settings</h1>
                    <IconButton 
                        class="absolute top-1 -left-7"
                        data={mdiChevronDoubleRight} 
                        size="48px" 
                        on:click={() => editOpen = false} 
                    />
                </div>

                <Divider>
                    <Divider.Label slot="label"></Divider.Label>
                </Divider>
                    
                {#if editItem !== undefined}
                    <svelte:component 
                        this={findEditor(editItem.type)}
                        settings={editItem}
                        on:settings={e => updateWidget(e.detail)}
                    />
                {:else}
                    dashboard
                {/if}
            </div>
        </Drawer>

        {#if !editOpen}
            <div class="fixed z-10" style="top:calc(100vh/2 - 48px/2);right:0px;">
                <IconButton 
                    data={mdiCog} 
                    size="48px" 
                    on:click={() => editOpen = true} 
                />
            </div>
        {/if}

        {#if layout !== undefined && items !== undefined && widgets !== undefined}
            <Grid
                bind:items={items}
                columns={layout.columns}
                rowHeight={layout.rowHeight}
                editable={true}
                let:item
                on:select={e => selectWidget(e.detail)}
            >
                <Widget setting={getWidget(item.id)} />
            </Grid>
        {/if}
    {/if}