<script lang="ts">
    import Grid from '$lib/components/grid/Grid.svelte';
    import type { WidgetSettings } from '$lib/types/Widgets';
    import { createEventDispatcher } from 'svelte';
    
    import Widget from '../Widget.svelte';
    
    import type { CardSettings_v1 } from './CardSettings';
    import type { GridItemLayout_v1, GridItem_v2 } from '$lib/types/Grid';

    export let item: GridItemLayout_v1;
    export let settings: CardSettings_v1;
    export let editable: boolean;

    const dispatch = createEventDispatcher();

    $: items = settings.items ?? [];
    $: layouts = settings.layouts ?? [{ columns: item.w, rowHeight: 32, minWidth: 0, maxWidth: undefined }];
    $: margin = settings.margin ?? 4;
    $: padding = settings.padding ?? 4;

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

<div>
    <div class="card bg-base-200 shadow-md overflow-hidden" style="height: calc(100% - {margin*2}px); width: calc(100% - {margin*2}px); margin: {margin}px;">
        <div class="card-body w-full h-full" style="padding: {padding}px;">
            <Grid 
                items={items}
                layouts={layouts}
                on:items={e => updateItems(e.detail)}
                {editable}
                let:item
            >
                <Widget settings={getWidget(item.id)} {item} {editable} />
            </Grid>
        </div>
    </div>
</div>