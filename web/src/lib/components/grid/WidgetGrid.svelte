<script lang="ts">
    import type {
        GridItemHTMLElement,
        GridStack,
        GridStackNode,
        GridStackOptions
    } from "gridstack";

    import "gridstack/dist/gridstack-extra.min.css";
    import "gridstack/dist/gridstack.min.css";
    import "./Gridstack.css"

    import { v4 as uuid } from 'uuid';

    import type { GridItem_v2, GridOptions_v1 } from "$lib/types/Grid";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import type { WidgetContext, WidgetSettings_v1 } from "$lib/types/Widgets";

    import { findInfo } from "$lib/widgets";
    import Widget from "$lib/widgets/Widget.svelte";

    export let options: GridOptions_v1;
    export let items: GridItem_v2[];
    export let context: WidgetContext;
    export let editable: boolean | undefined;

    let gridStackOptions: GridStackOptions;
    $: gridStackOptions = { ...options, acceptWidgets: true, disableDrag: !(editable ?? context.editable), disableResize: !(editable ?? context.editable) };
    $: onEditable(editable ?? context.editable);

    const dispatch = createEventDispatcher();

    let gridEl: HTMLDivElement;
    let grid: GridStack;

    const gridPromise = new Promise(resolve => {
        onMount(async () => {
            const { GridStack } = await import("GridStack");
            grid = GridStack.init(gridStackOptions, gridEl);

            GridStack.setupDragIn('.grid-stack-toolbar-item', { appendTo: 'body', helper: 'clone' });

            grid.on('dropped', dropped);
            grid.on('enable', (event: Event) => { dispatch('enable', event); });
            grid.on('disable', (event: Event) => { dispatch('disable', event); });
            grid.on('change', change);
            grid.on('added', added);
            grid.on('removed', removed);
            grid.on('resizecontent', (event: Event, nodes: GridStackNode[]) => { dispatch('resizecontent', ({ event, nodes })); });
            grid.on('resizestart', (event: Event, el: GridItemHTMLElement) => { dispatch('resizing', true); dispatch('resizestart', ({ event, el })); });
            grid.on('resize', (event: Event, el: GridItemHTMLElement) => { dispatch('resize', ({ event, el })); });
            grid.on('resizestop', (event: Event, el: GridItemHTMLElement) => { dispatch('resizing', false); dispatch('resizestop', ({ event, el })); });
            grid.on('dragstart', (event: Event, el: GridItemHTMLElement) => { dispatch('dragging', true); dispatch('dragstart', ({ event, el })); });
            grid.on('drag', (event: Event, el: GridItemHTMLElement) => { dispatch('drag', ({ event, el })); });
            grid.on('dragstop', (event: Event, el: GridItemHTMLElement) => { dispatch('dragging', false); dispatch('dragstop', ({ event, el })); });

            resolve(grid);
        });
    });

    onDestroy(() => {
        grid?.offAll();
        grid?.destroy();
    });

    function onEditable(_editable: boolean) {
        if(grid !== undefined) {
            if(_editable) {
                grid.enable();
            } else {
                grid.disable();
            }
        }
    }

    function dropped(event: Event, previousNode: GridStackNode, newNode: GridStackNode) {
        dispatch('dropped', ({ event, previousNode, newNode }));

        // if we don't have a previousNode that means it was copied from the toolbar.
        if (previousNode) return;

        // Expect the node to have a type defined as an extra attribute.
        const type: string | null | undefined = newNode.el?.getAttribute('widget-type');

        if(type !== null && type !== undefined) {
            const info = findInfo(type);

            if(info !== undefined) {
                const settings = info.create();
                const item: GridItem_v2 = { 
                    id: uuid(), 
                    settings, 
                    position: { 
                        x: newNode.x,
                        y: newNode.y,
                        w: newNode.w,
                        h: newNode.h
                    }
                }

                // Remove the widget from the grid, but add it to the items list. This will force the 
                // widget to be created by Svelte and then added to the grid
                const removeDOM = true;
                const triggerEvent = true;
                grid.removeWidget(newNode.el!, removeDOM, triggerEvent);

                // Append the item and notify parent
                items = [...items, item];
                dispatch('items', items);
            }
        }
    }

    function added(event: Event, nodes: GridStackNode[]) {
        const add = nodes
            .filter(n => !items.some(i => i.id === n.id))
            .map((n: any) => ({ id: n.id, position: { x: n.x, y: n.y, w: n.w, h: n.h }, settings: n.settings }));

        items = [...items, ...add];
        dispatch('items', items);
    }

    function removed(event: Event, nodes: GridStackNode[]) {
        items = items!.filter(i => !nodes.some(n => n.id === i.id));
        dispatch('items', items);
    }

    function change(event: Event, nodes: GridStackNode[]) {
        dispatch('change', ({ event, nodes }));

        nodes.forEach(node => {
            let item = items!.find(i => i.id === node.id);

            if(item !== undefined) {
                item!.position.x = node.x;
                item!.position.y = node.y;
                item!.position.w = node.w;
                item!.position.h = node.h;
            }
        });

        dispatch('items', items);
    }

    function update(index: number, updated: WidgetSettings_v1) {
        const copy = [...items];
        copy[index].settings = updated;

        items = copy;

        dispatch('items', items);
    }

    function getSettings(index: number) : WidgetSettings_v1 {
        return items[index].settings;
    }

    function addToGrid(element: HTMLDivElement, item: GridItem_v2) {
        grid.makeWidget(element, { id: item.id, ...item.position, settings: item.settings });
    }
</script>

<div bind:this={gridEl} class="w-full h-full">
    {#await gridPromise then g}
        {#each items as item, index (item.id)}
            <div class="grid-stack-item flex" use:addToGrid={item}>
                <div class="grid-stack-item-content flex-grow">
                    {#if item.settings !== undefined}
                        <Widget settings={item.settings} on:settings={(e) => update(index, e.detail)} {context} />
                    {/if}
                </div>
            </div>
        {/each}
    {/await}
</div>