<script lang="ts">
    import type { GridItem_v2, GridOptions_v1 } from "$lib/types/Grid";
    import { createEventDispatcher } from "svelte";
    import { grid, gridZone } from "./gridAction";
    import type { WidgetSettings_v1 } from "$lib/types/Widgets";

    import Gridstack from "./Gridstack.svelte";
    import type { GridStackOptions, GridStackWidget } from "gridstack";

    export let options: GridOptions_v1;
    export let items: GridItem_v2[];
    export let editable: boolean | undefined;

    let gridStackOptions: GridStackOptions;
    let gridStackItems: GridStackWidget[];

    $: gridStackItems = items.map(i => ({ id: i.id, ...i.position }));
    $: gridStackOptions = { ...options, acceptWidgets: editable, staticGrid: editable };

    const dispatch = createEventDispatcher();

    function updateItems(_items: GridItem_v2[]) {
        items = _items;
        dispatch('items', items);
    }

    function updateSettings(settings: WidgetSettings_v1) {
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

</script>

<Gridstack opts={gridStackOptions} items={gridStackItems} let:index let:item>
    <slot gridItem={item} />
</Gridstack>