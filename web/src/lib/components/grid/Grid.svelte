<script lang="ts">
    import type { GridItemLayout_v1, GridItem_v2, GridLayout_v2 } from "$lib/types/Grid";
    import { createEventDispatcher } from "svelte";
    import { grid, gridZone } from "./gridAction";
    import type { WidgetSettings } from "$lib/types/Widgets";

    export let layouts: GridLayout_v2[];
    export let items: GridItem_v2[];
    export let editable: boolean | undefined;

    let element: HTMLElement;
    let layout: GridLayout_v2 | undefined;
    let layoutIndex: number = 0;
    let itemLayouts: GridItemLayout_v1[] = [];

    $: getLayout(layouts, items, element);

    $: columns = layout?.columns ?? 1;
    $: rowHeight = layout?.rowHeight ?? 25;

    const dispatch = createEventDispatcher();

    function updateItems(_items: GridItem_v2[]) {
        items = _items;
        dispatch('items', items);
    }

    function updateSettings(settings: WidgetSettings) {
        const item = items.find(i => i.id === settings.id);

        if(item !== undefined) {
            item.settings = settings;
        }

        dispatch('items', items);
    }

    function onSelected(e: any) {
        dispatch('selected', e);
    }

    function onMoving(e: any) {
        dispatch('moving', e);
    }

    function getLayout(_layouts: GridLayout_v2[], _items: GridItem_v2[], _element?: HTMLElement) {
        if(_element === undefined) {
            return;
        }

        if(_layouts.length == 0) {
            layoutIndex = 0;
            layout = { minWidth: 0, maxWidth: undefined, columns: 1, rowHeight: 25 };
            itemLayouts = _items.map(item => item.layouts[layoutIndex]);

            return;
        }

        const rect = _element.getBoundingClientRect();
        layoutIndex = zoneLayoutIndex(_layouts, rect);
        layout = _layouts[layoutIndex];
        itemLayouts = _items.map(item => item.layouts[layoutIndex]);
    }

    function zoneLayoutIndex(_layouts: GridLayout_v2[], rect: DOMRect) : number {
        const width = rect.width;
        const index = _layouts.findLastIndex(l => l.minWidth < width);

        if(index === -1) {
            return layouts.length - 1;
        }

        return index;
    }

</script>

<div bind:this={element} class="w-full h-full">
    {#if layout !== undefined}
        {#if editable}
            <div
                class="w-full h-full"
                style="background-size: calc(100%/{columns}) {rowHeight}px; background-image: radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px); background-position: {100/(columns*2)}% -{rowHeight/2}px;"
                use:gridZone={{ items, layoutIndex, layout }}
                on:items={e => updateItems(e.detail)}
                on:selected={e => onSelected(e.detail)}
                on:moving={e => onMoving(e.detail)}
                on:settings={e => updateSettings(e.detail)}
            >
                {#each items as item(item.id)}
                    <slot item={item.layouts[layoutIndex]} {editable} />
                {/each}
            </div>
        {:else}
            <div
                class="w-full h-full"
                use:grid={{ items, layoutIndex, layout }}
            >
                {#each items as item(item.id)}
                    <slot item={item.layouts[layoutIndex]} {editable} />
                {/each}
            </div>
        {/if}
    {/if}
</div>