<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { sineIn } from 'svelte/easing';

    // Stores
    import { homey, dashboards as homeyDashboards } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { editing, dashboard as currentDashboard } from '$lib/stores/dashboard';

    // Tailwind
    import Icon from "stwui/icon";

    // UI elements
    import DashboardEditor from '$lib/widgets/DashboardEditor.svelte';

    // Types
    import type { GridItem_v2, GridLayout_v2 } from '$lib/types/Grid';
    import type { WidgetSettings } from '$lib/types/Widgets';
    import { widgets as widgetTypes, type WidgetInfo, findCreate, findEditor } from '$lib/widgets';
    import type { DashboardMap, Dashboard_v2 } from '$lib/types/Dashboard';
    
    import Widget from '$lib/widgets/Widget.svelte';

    import { v4 as uuid } from 'uuid';

    import { webhookId, webhookUrl } from '$lib/constants';

    import { migrate as migrateDashboard } from '$lib/widgets/migrations';
    import { mdiBookEdit, mdiClose, mdiCog, mdiLock, mdiWidgets } from '$lib/components/icons';
    import Grid from '$lib/components/grid/Grid.svelte';
    import { Drawer } from 'flowbite-svelte';

    let clientWidth: number;

    let widgetsHidden: boolean = false;

    let editHidden: boolean = true;
    let editItem: GridItem_v2 | undefined;
    let editSettings: WidgetSettings | undefined;
    let editZone: HTMLElement | undefined;

    let moving: boolean = false;

    $: dashboardId = $page.url.searchParams.get('id');

    let dashboards: DashboardMap;
    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    
    let dashboard: Dashboard_v2 | undefined;
    $: dashboard = dashboardId !== null ? dashboards[dashboardId] : undefined;
    $: onDashboard(dashboard, clientWidth);

    let layouts: GridLayout_v2[];
    let layout: GridLayout_v2 | undefined;
    let layoutIndex: number;
    let items: GridItem_v2[] | undefined;
    let migrated: boolean = false;

    onMount(async () => {
        if($homey === undefined) { // Not logged in
            await goto(base + '/');
        }
    });

    function onDashboard(_dashboard: Dashboard_v2 | undefined, _clientWidth: number | undefined)
    {
        if(_clientWidth === undefined) return;

        if(!$editing || dashboard !== _dashboard) {
            currentDashboard.set(_dashboard);

            const dash = migrateDashboard(_dashboard);
            migrated = dash !== _dashboard;

            layouts = dash?.layouts ?? [];
            layoutIndex = layouts.findLastIndex(l => l.minWidth < _clientWidth);
            layout = layouts[layoutIndex];
            items = dash?.items ?? [];
        }
    }

    function selectItem(e: any) {
        const id: string | undefined = e.id;
        const item: GridItem_v2 = e.item;
        const zone: HTMLElement = e.zone;

        if(id === undefined) {
            editSettings = undefined;
            editZone = undefined;

            return;
        }

        editItem = item;
        editSettings = item.settings;
        editZone = zone;
    }

    function getWidget(id: any) : WidgetSettings {
        if(items === undefined) return { id, type: 'unknown', version: 1 };

        return items.find(i => i.id === id)!.settings;
    }

    function addWidget(info: WidgetInfo, e: any) {
        var create = findCreate(info.type);

        if(create !== undefined && layout !== undefined) {
            const widget = create();
            const itemLayouts = layouts.map(l => ({ id: widget.id, x: l.columns / 2, y: 0, w: 2, h: 2 }));
            const item: GridItem_v2 = { id: widget.id, settings: widget, layouts: itemLayouts };

            items = [...(items ?? []), item];
        }
    }

    function updateWidgetSettings(settings: WidgetSettings) {
        const item = (items ?? []).find(i => i.id === settings.id);
        
        if(item !== undefined) {
            item.settings = settings;
        }

        items = [...items ?? []]; // Force reload
    }

    function updateZoneWidgetSettings(settings: WidgetSettings) {
        editZone!.dispatchEvent(new CustomEvent('settings', { detail: settings }));
    }

    function addLayout(minWidth: number, columns: number) {
        const l: GridLayout_v2 = { minWidth, maxWidth: undefined, columns, rowHeight: 24 };

        layouts = layouts ?? [];

        layouts.push(l);
        layout = l;

        items = items ?? [];

        // TODO: Add layout to every item.

        editing.set(true);
    }

</script>

<div bind:clientWidth={clientWidth} class="w-full h-full">
    {#if $homey !== undefined}
        {#if $editing}
            <Drawer 
                placement="left" 
                transitionType="fly" 
                transitionParams={{ x: -320, duration: 200, easing: sineIn }} 
                backdrop={false}
                activateClickOutside={false}
                hidden={widgetsHidden || moving}
                on:hidden={e => (widgetsHidden = e.detail)} 
                id="widgets"
            >
                <div class="h-full w-full flex flex-col">
                    <div class="w-full flex justify-between items-center">
                        <h1 class="flex-grow text-center text-2xl">Widgets</h1>
                        <button class="btn btn-circle" on:click={() => widgetsHidden = true}>
                            <Icon data={mdiClose} />
                        </button>
                    </div>
                    
                    <div class="divider" />

                    <div class="overflow-y-auto">
                        {#each widgetTypes as widget}
                            <div class="flex flex-row items-center m-2 hover:bg-primary-hover rounded-md" on:pointerdown|stopPropagation={e => addWidget(widget, e.detail)}>
                                <Icon data={widget.icon} size="48" />
                                <span class="ml-4">{widget.label}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            </Drawer>

            {#if widgetsHidden}
                <div class="fixed z-10" style="top:calc(100vh/2 - 48px/2);left:0px;">
                    <button class="btn btn-circle" on:click={() => widgetsHidden = false}>
                        <Icon data={mdiWidgets} />
                    </button>
                </div>
            {/if}

            <Drawer 
                placement="right" 
                transitionType="fly" 
                transitionParams={{ x: 320, duration: 200, easing: sineIn }} 
                backdrop={false}
                activateClickOutside={false}
                hidden={editHidden || moving}
                on:hidden={e => (editHidden = e.detail)} 
                id="settings"
            >
                <div class="h-full w-full flex flex-col">
                    <div class="w-full flex justify-between items-center">
                        <button class="btn btn-circle" on:click={() => editHidden = true}>
                            <Icon data={mdiClose} />
                        </button>
                        
                        <h1 class="flex-grow text-center text-2xl">Settings</h1>
                    </div>

                    <div class="divider" />
                        
                    {#if editSettings !== undefined}
                        <svelte:component 
                            this={findEditor(editSettings.type)}
                            settings={editSettings}
                            on:settings={e => updateZoneWidgetSettings(e.detail)}
                        />
                    {:else if dashboard !== undefined}
                        <DashboardEditor settings={dashboard} />
                    {/if}
                </div>
            </Drawer>

            {#if editHidden}
                <div class="fixed z-10" style="top:calc(100vh/2 - 48px/2);right:0px;">
                    <button class="btn btn-circle" on:click={() => editHidden = false} >
                        <Icon data={mdiCog} />
                    </button>
                </div>
            {/if}
        {/if}

        {#if layout !== undefined && items !== undefined}
            <Grid
                layouts={layouts}
                editable={$editing}
                bind:items={items}
                let:item
                on:selected={e => selectItem(e.detail)}
                on:moving={e => (moving = e.detail)}
            >
                <Widget settings={getWidget(item.id)} on:settings={e => updateWidgetSettings(e.detail)} item={item} editable={$editing} />
            </Grid>
        {:else}
            <div class="flex justify-center">
                <div class="card w-full max-w-md mt-8 bg-base-300">
                    <div class="card-body">
                        <h1 class="card-title">👋 Hello there!</h1>
                        <p class="py-1">This is a brand new dashboard with no layouts. Lets add one to get you started!</p>
                        
                        <p class="py-1">What kind of device are you planning on using this dashboard on?</p>
                        <p class="py-3 w-full flex flex-col items-center">
                            <button class="btn w-64 my-1" on:click={() => addLayout(640, 8)}>Vertical mobile</button>
                            <button class="btn w-64 my-1" on:click={() => addLayout(768, 12)}>Horizontal mobile</button>
                            <button class="btn w-64 my-1" on:click={() => addLayout(1024, 16)}>Vertical tablet</button>
                            <button class="btn w-64 my-1" on:click={() => addLayout(1280, 20)}>Horizontal tablet</button>
                            <button class="btn w-64 my-1" on:click={() => addLayout(1536, 24)}>Computer</button>
                        </p>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>
