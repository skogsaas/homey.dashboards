<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { CanvasSettings_v1 } from './CanvasSettings';
    import type { GridItem_v2, GridOptions_v1 } from '$lib/types/Grid';
    import type { GridStackWidget } from 'gridstack';

    import WidgetGrid from '$lib/components/grid/WidgetGrid.svelte';

    export let gridItem: GridStackWidget;
    export let context: WidgetContext;
    export let settings: CanvasSettings_v1;

    const dispatch = createEventDispatcher();

    let items: GridItem_v2[];
    let options: GridOptions_v1;

    $: items = settings?.items ?? [];
    $: options = settings?.options ?? { cellHeight: 2, columnOpts: { columnMax: 50 }, float: true, margin: 0 };

    function updateItems(i: GridItem_v2[]) {
        settings = { ...settings, items: i };

        dispatch('settings', settings);
    }
</script>

<div class="h-full w-full">
    <WidgetGrid {options} bind:items={items} {context} />
</div>