<script lang="ts">
    import GridShadow from "./GridShadow.svelte";
    import GridElement from "./GridElement.svelte";
    import type { GridLayoutItem_v1 } from "$lib/types/Grid";
    import { CalculatePosition } from "./GridUtils";
    import { createEventDispatcher } from "svelte";
    import GridContainer from "./GridContainer.svelte";

    export let items: GridLayoutItem_v1[];

    export let columns: number;
    export let rowHeight: number;
    export let editable: boolean;

    const dispatch = createEventDispatcher();

    let width: number;

    let offsetX: number;
    let offsetY: number;
    let shadowX: number;
    let shadowY: number;
    let shadowH: number;
    let shadowW: number;

    let mode: 'position'|'width'|'height' = 'position';
    let selected: any | undefined;
    let dragging: boolean = false;

    function select(item: any) {
        if(dragging) {
            return;
        }
        
        if(selected === item) {
            selected = undefined;
        } else {
            selected = item;
        }

        dispatch('select', selected?.id);
    }
    
    function pointerdown(item: any, e: any) {
        offsetY = e.clientY - item.y * rowHeight;
        offsetX = e.clientX - item.x * width / columns;

        shadowX = item.x;
        shadowY = item.y;
        shadowH = item.h;
        shadowW = item.w;
        
        dragging = true;
    }

    function pointerup(item: any, e: any) {
        if(item.x !== shadowX || item.y !== shadowY || item.w !== shadowW || item.h !== shadowH) {
            const index = items.findIndex(i => i.id === item.id);
            const copy = [...items];

            selected = { ...item, x: shadowX, y: shadowY, w: shadowW, h: shadowH };
            copy[index] = selected;

            items = copy;
        }

        dragging = false;
    }

    function pointermove(item: any, e: any) {
        if(mode === 'position') {
            const shadow = CalculatePosition(columns, width, rowHeight, e.clientX - offsetX, e.clientY - offsetY);

            shadowY = shadow.y;
            shadowX = shadow.x;
        } else if(mode === 'width') {
            shadowW = Math.round(columns / width * (e.clientX - (item.x * width / columns)));
        } else if(mode === 'height') {
            shadowH = Math.round((e.clientY - (rowHeight * item.y)) / rowHeight);
        }
    }

</script>

<div 
    class="w-full h-full relative" 
    bind:clientWidth={width}
    on:pointerdown={() => select(undefined)}
>
    {#each items as item(item)}
        <GridElement
            {columns}
            {rowHeight}
            {editable}
            id={item.id}
            x={item.x}
            y={item.y}
            h={item.h}
            w={item.w}
            focus={item === selected}
            highlighted={dragging}
            

            on:select={e => select(item)}
            on:mode={e => mode = e.detail}
            on:down={e => pointerdown(item, e.detail)}
            on:up={e => pointerup(item, e.detail)}
            on:move={e => pointermove(item, e.detail)}
        >
            <slot {item} />
        </GridElement>
    {/each}

    {#if dragging}
        <GridShadow
            columns={columns}
            rowHeight={rowHeight}
            x={shadowX}
            y={shadowY}
            h={shadowH}
            w={shadowW}
        />
    {/if}
</div>