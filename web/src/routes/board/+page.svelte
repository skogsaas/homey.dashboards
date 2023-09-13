<script lang="ts">
    // Svelte
    import { onMount, type ComponentType, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { devices, homey, dashboards as homeyDashboards, scopes } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { editing, grid, dashboard as currentDashboard } from '$lib/stores/dashboard';
    
    // UI components
    import ConfirmDialog from '$lib/ConfirmDialog.svelte';
    import AddWidgetDialog from '$lib/AddWidgetDialog.svelte';
    import EditWidgetView from '$lib/EditWidgetView.svelte';

    // Tailwind
    import Drawer from "stwui/drawer";
    import Portal from "stwui/portal";
    import Modal from "stwui/modal";
    import Button from "stwui/button";
    import Icon from "stwui/icon";

    // Types
    import type { GridItem } from '$lib/types/Grid';
    import type { WidgetSettings } from '$lib/types/Widgets';
    import { widgets, findCreate, findLabel, findMigration, findView, findWidget } from '$lib/widgets';
    import type Dashboard from '$lib/types/Dashboard';
    
    import Grid from "$lib/components/grid/index.svelte";
    import gridHelp from "$lib/components/grid/utils/helper";
    import WidgetContainer from '$lib/widgets/WidgetContainer.svelte';

    import { webhookId, webhookUrl } from '$lib/constants';
    import { mdiClose } from '$lib/components/icons';
    
    const smallBreakpoint = 640;
    const mediumBreakpoint = 768;
    const largeBreakpoint = 1024;
    const xlargeBreakpoint = 1280;
    export const breakpoints: number[] = [smallBreakpoint, mediumBreakpoint, largeBreakpoint, xlargeBreakpoint];

    const smallColumns = 6;
    const mediumColumns = 12;
    const largeColumns = 18;
    const xlargeColumns = 24;
    export const columns: number[] = [smallColumns, mediumColumns, largeColumns, xlargeColumns];

    export const breakpointColumns = [
        [smallBreakpoint, smallColumns], 
        [mediumBreakpoint, mediumColumns],
        [largeBreakpoint, largeColumns],
        [xlargeBreakpoint, xlargeColumns]
    ];

    let items: GridItem[] = [];

    let viewOpen: boolean = false;
    let viewItem: GridItem | undefined;
    let viewComponent: ComponentType | undefined;
    
    let editOpen: boolean = false;
    let editItem: GridItem;

    let addWidgetOpen = false;

    let dashboard: Dashboard | undefined;
    let savingDashboard: boolean = false;

    let heartbeat: number | undefined;

    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    $: dashboardId = $page.url.searchParams.get('id');
    $: resolvedDashboard = dashboardId !== null ? dashboards[dashboardId] : undefined;

    $: onDashboard(resolvedDashboard);
    $: onEditing($editing);

    onMount(() => {
        heartbeat = setInterval(() => sendHeartbeat(), 30 * 1000);
    });

    onDestroy(() => {
        if(heartbeat !== undefined) {
            clearInterval(heartbeat);
        }
    });

    function onDashboard(d: Dashboard | undefined) {
        if(d !== undefined && !$editing && d.items !== items) {
            currentDashboard.set(d);
            dashboard = d;
            items = migrateWidgets(d.items);
        }
    }

    function onEditing(edit: boolean) { 
        const result = [...items];

        result.forEach((item: GridItem) => { 
            columns.forEach(column => {
                item[column].draggable = edit;
                item[column].resizable = edit;
            });
        });

        items = result;
    }

    function migrateWidgets(i: GridItem[]) : GridItem[] {
      const result: GridItem[] = [];
      let changes: boolean = false;

      for(let item of i) {
        const migration = findMigration(item.settings.type);
        const migrated = migration !== undefined ? migration(item.settings) : item.settings;

        if(migrated !== item.settings) {
          changes = true;
        }

        result.push({ ...item, settings: migrated });
      }

      if(changes) {
        return result;
      }

      return i;
    }

    function addWidget(type: string) : void {
        if(type === undefined) {
          return;
        }

        const create = findCreate(type);

        if(create !== undefined) {
          const settings = create();
          const item: GridItem = { id: settings?.id, settings };

          editItem = addItem(item);
          editOpen = true;
        }
    }

    function editWidget(item: GridItem) : void {
        editItem = item;
        editOpen = true;
    }

    function saveWidget(settings: WidgetSettings) {
      editOpen = false;
      setItemSettings(editItem.id, settings);
    }

    function openView(item: GridItem) {
        if($editing) {
            return;
        }

        viewItem = item;
        viewComponent = findView(viewItem.settings.type);

        if(viewItem !== undefined && viewComponent !== undefined) {
            viewOpen = true;
        }
    }

    function addItem(item: GridItem) {
        const result = [...items, item];

        columns.forEach(column => {
            item[column] = gridHelp.item({ x: 0, y: 0, w: 3, h: 3, resizable: true, draggable: true });
            
            const findOutPosition = gridHelp.findSpace(item, result, column);

            item[column] = {
                ...item[column],
                ...findOutPosition
            };
        });

        items = result;

        return item;
    }

    function removeItem(id: string) {
        items = items.filter(item => item.id !== id);
    }

    function setItemFixed(id: string, fixed: boolean) { 
        const result = [...items];
        const item = result.find(i => i.id === id);

        if(item) {
            columns.forEach(column => {
                item[column].fixed = fixed;
                item[column].draggable = !fixed;
                item[column].resizable = !fixed;
            });
        }

        items = result;
    }
    
    function setItemSettings(id: string, settings: WidgetSettings) {
        const result = [...items];
        const item = result.find(i => i.id === id);

        if(item) {
            item.settings = settings;
        }
        
        items = result;
    }

    async function saveChanges() {
        if(dashboard === undefined) {
            editing.set(false);
            return;
        } else {
            savingDashboard = true;
            dashboard.items = items;

            if(dashboard.source === 'localstorage') {
                const d = { ...dashboard, items: stripGrid(items) };
                localDashboards.update(d);
            } else if(dashboard.source === 'homey') {
                const settings = { items: stripGrid(items) };
                let success: boolean = false;

                const dashboardDevice = Object.values($devices).find(device => device.data.id === dashboard!.id);

                if(dashboardDevice !== undefined) {
                    dashboardDevice.settings = settings;
                }

                // Send over webhook
                try {
                    const url = webhookUrl + webhookId + '?homey=' + $homey.id + '&operation=save_dashboard&dashboardId=' + dashboard.id;
                    const response = await fetch(url, { method: 'POST', body: JSON.stringify(settings) });

                    if(response.ok) {
                        success = true;
                    }
                } catch(e) {
                }

                // Try accessing the api directly
                if(!success) {
                    if($scopes.includes('homey') || $scopes.includes('homey.app')) {
                        try {
                            const app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
                            
                            if(app !== undefined) {
                                await app.put({ path: '/dashboards/' + dashboard.id, body: settings });
                                success = true;
                            }
                        } catch(e) {
                            // Do nothing
                        }
                    }
                }
            }
        }

        savingDashboard = false;
        editing.set(false);
    }

    function cancelChanges() {
        if(dashboard === undefined) {
            return;
        }

        items = migrateWidgets(dashboard.items ?? []);

        editing.set(false);
    }

    async function deleteDashboard() {
        if(dashboard === undefined) {
            return;
        }

        localDashboards.delete(dashboard);
        editing.set(false);

        await goto(base + '/');
    }

    function stripGrid(i: GridItem[]) { 
        const result = [...i];

        result.forEach((item: any) => { 
            columns.forEach(column => {
                delete item[column].draggable;
                delete item[column].resizable;
                delete item[column].customDragger;
                delete item[column].customResizer;
            });
        });

        return result;
    }

    async function sendHeartbeat() {
        let success: boolean = false;

        // Send over webhook
        try {
            let url = webhookUrl + webhookId + '?homey=' + $homey.id + '&operation=active_dashboard';

            if(dashboard !== undefined) {
                url += '&dashboardId=' + dashboard.id;
            }

            const response = await fetch(url, { method: 'POST', body: '' });

            if(response.ok) {
                success = true;
            }
        } catch(e) {
        }

        // Try accessing the api directly
        /* TODO: Create local api for this
        if(!success) {
            if($scopes.includes('homey') || $scopes.includes('homey.app')) {
                try {
                    const app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
                    
                    if(app !== undefined) {
                        await app.put({ path: '/dashboards/' + dashboard.id, body: settings });
                        success = true;
                    }
                } catch(e) {
                    // Do nothing
                }
            }
        }
        */
    }

</script>

{#if $homey !== undefined}
    <EditWidgetView item={editItem} bind:open={editOpen} on:settings={(e) => saveWidget(e.detail)} />

    <div class="flex justify-center">
        {#if $editing}
            <div>
                {#each widgets as widget}
                    <Button on:click={() => addWidget(widget.type)} ariaLabel={widget.label}>
                        <Icon data={widget.icon} />
                    </Button>    
                {/each}
            </div>

            <div class="ml-4">
                <Button on:click={() => (addWidgetOpen = true)}>Add</Button>
                <Button on:click={() => saveChanges()}>Save</Button>
                <Button on:click={() => cancelChanges()}>Cancel</Button>
            </div>
        {/if}
    </div>
        
    <Grid 
        fastStart
        cols={breakpointColumns} 
        gap={$grid.gaps} 
        rowHeight={50} 
        bind:items={items}
        on:mount={(e) => grid.updateSize(e.detail)}
        on:resize={(e) => grid.updateSize(e.detail)}
        let:item 
        let:dataItem
    >
        <WidgetContainer 
            fixed={item.fixed ?? false}
            on:fixed={(e) => setItemFixed(dataItem.id, e.detail)}
            on:edit={() => editWidget(dataItem)}
            on:delete={() => removeItem(dataItem.id)}
            on:click={() => openView(dataItem)}
        >
            <svelte:component 
                this={findWidget(dataItem.settings.type)}
                settings={dataItem.settings}
            />
        </WidgetContainer>
    </Grid>
    
    <Portal>
        {#if viewOpen}
            <Modal handleClose={() => viewOpen = false}>
                <Modal.Content slot="content">
                    <Modal.Content.Body slot="body">
                        {#if viewItem !== undefined && viewComponent !== undefined}
                            <svelte:component 
                                this={viewComponent}
                                settings={viewItem.settings}
                            />
                        {/if}
                    </Modal.Content.Body>
                </Modal.Content>
            </Modal>
        {/if}
    </Portal>

    <AddWidgetDialog bind:open={addWidgetOpen} on:selected={e => addWidget(e.detail)} />
{/if}