<script lang="ts">
    import Grid from '$lib/components/grid/Grid.svelte';
    import type { WidgetSettings } from '$lib/types/Widgets';
    import { createEventDispatcher } from 'svelte';
    
    import Widget from '../Widget.svelte';
    
    import type { CanvasSettings_v1 } from './CanvasSettings';
    import type { GridItemLayout_v1, GridItem_v2 } from '$lib/types/Grid';

    export let item: GridItemLayout_v1;
    export let settings: CanvasSettings_v1;

    const dispatch = createEventDispatcher();

    $: items = settings.items ?? [];
    $: layouts = settings.layouts ?? [{ columns: 100, rowHeight: 5, minWidth: 0, maxWidth: undefined }];

    function updateItems(i: GridItem_v2[]) {
        items = i;
        settings = { ...settings, items: i };

        dispatch('settings', settings);
    }
    
    function getWidget(id: any) : WidgetSettings {
        const childItem = items.find(i => i.id === id);

        if(childItem === undefined) return { id, type: 'unknown', version: 1 };

        return childItem.settings;
    }
</script>

<div class="h-full w-full">
    <Grid 
        items={items}
        layouts={layouts}
        on:items={e => updateItems(e.detail)}
        let:item
    >
        <Widget settings={getWidget(item.id)} {item} />
    </Grid>
</div>