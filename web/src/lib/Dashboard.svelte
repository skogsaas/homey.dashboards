<script lang="ts">
    import { grid, items, breakpointColumns, editing } from '$lib/stores/dashboard';

    import Grid from "$lib/components/grid/index.svelte";
    import Dialog, { Content } from '@smui/dialog';
    import IconButton from '@smui/icon-button';

    import WidgetContainer from './widgets/WidgetContainer.svelte';
    import { findView, findWidget } from './widgets/widgets';
    import { createEventDispatcher, type ComponentType } from 'svelte';
    import type { GridItem } from './types/Grid';
    
    const dispatch = createEventDispatcher();

    let viewOpen: boolean = false;
    let viewItem: GridItem | undefined;
    let viewComponent: ComponentType | undefined;

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
</script>

<Grid 
    fastStart
    cols={breakpointColumns} 
    gap={$grid.gaps} 
    rowHeight={50} 
    bind:items={$items}
    on:mount={(e) => grid.updateSize(e.detail)}
    on:resize={(e) => grid.updateSize(e.detail)}
    let:item 
    let:dataItem
>
    <WidgetContainer 
        fixed={item.fixed ?? false}
        on:fixed={(e) => items.setFixed(dataItem.id, e.detail)}
        on:edit={() => dispatch('edit', dataItem)}
        on:delete={() => items.removeItem(dataItem.id)}
        on:click={() => openView(dataItem)}
    >
        <svelte:component 
            this={findWidget(dataItem.settings.type)}
            settings={dataItem.settings}
        />
    </WidgetContainer>
</Grid>

<Dialog
    fullscreen
    sheet
    noContentPadding
    bind:open={viewOpen}
>
    <div style="position: relative;">
        <IconButton style="position: absolute; top: 0px; right: 0px;" action="close" class="material-icons">close</IconButton>
        {#if viewItem !== undefined && viewComponent !== undefined}
            <svelte:component 
                this={viewComponent}
                settings={viewItem.settings}
            />
        {/if}
    </div>
</Dialog>