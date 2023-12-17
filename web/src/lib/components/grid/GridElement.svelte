<script lang="ts">
    import { editing } from "$lib/stores/dashboard";

    import { createEventDispatcher, onMount } from "svelte";

    export let columns: number;
    export let rowHeight: number;
    export let editable: boolean = false;
    
    export let id: any;
    export let x: number;
    export let y: number;
    export let h: number;
    export let w: number;

    export let focus: boolean;
    export let highlighted: boolean;

    const dispatch = createEventDispatcher();

    $: top = rowHeight * y + 'px';
    $: left = 'calc(100% / ' + columns + ' * ' + x + ')';
    
    $: height = rowHeight * h + 'px';
    $: width = 'calc(100% / ' + columns + ' * ' + w + ')';

    $: onEditable(editable);
    $: onChanges(x, y, h, w);
    $: onFocus(focus);

    let hasFocus: boolean = false;
    let element: HTMLElement;

    let posX: number = 0;
    let posY: number = 0;
    let mode: 'position'|'width'|'height' = 'position';
    let dragging: boolean = false;

    onMount(() => {
        onEditable(editable);

        // Set initial position
        onChanges(x, y, h, w);
    });

    function onEditable(e: boolean) {
        if(editable && element !== undefined) {
            element.addEventListener('click', click);
        }
    }

    function onChanges(_x: number, _y: number, _h: number, _w: number) {
        if(element !== undefined) {
            element.style.top = top;
            element.style.left = left;
            element.style.height = height;
            element.style.width = width;
        }
    }

    function onFocus(_focus: boolean) {
        if(element !== undefined) {
            if(hasFocus) {
                element.removeEventListener('pointerdown', positionDown);
            } else {
                element.addEventListener('pointerdown', positionDown);
            }
        }

        hasFocus = _focus;
    }

    function click(e: any) {
        e.stopPropagation();

        if(editable) {
            dispatch('select', e);
        }
    }

    function positionDown(e: any) {
        mode = 'position';
        dispatch('mode', mode);
        pointerdown(e);
    }

    function widthDown(e: any) {
        mode = 'width';
        dispatch('mode', mode);
        pointerdown(e);
    }

    function heightDown(e: any) {
        mode = 'height';
        dispatch('mode', mode);
        pointerdown(e);
    }

    function pointerdown(e: any) {
        pauseEvent(e);

        dragging = true;

        // Save start position
        posX = e.clientX;
        posY = e.clientY;

        dispatch('down', e);

        window.addEventListener('pointerup', pointerup);
        window.addEventListener('pointermove', pointermove);
    }

    function pointerup(e: any) {
        pauseEvent(e);

        dragging = false;

        dispatch('up', e);

        window.removeEventListener("pointermove", pointermove);
        window.removeEventListener("pointerup", pointerup);
    }

    function pointermove(e: any) {
        pauseEvent(e);

        if(!dragging) return;

        if(mode === 'position') {
            const x = posX - e.clientX;
            const y = posY - e.clientY;
            
            posX = e.clientX;
            posY = e.clientY;

            element.style.top = (element.offsetTop - y) + 'px';
            element.style.left = (element.offsetLeft - x) + 'px';
        } else if(mode === 'width') {
            element.style.width = 'calc(100% / ' + columns + ' * ' + w + ' + ' + (e.clientX - posX) + 'px)';
        } else if(mode === 'height') {
            element.style.height = (rowHeight * h) + (e.clientY - posY) + 'px';
        }
        
        dispatch('move', e);
    }

    function pauseEvent(e: any){
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble=true;
        e.returnValue=false;
    }

</script>

<div
    class="absolute outline-2"
    class:touch-none={focus}
    class:outline={focus}
    class:outline-primary={focus}
    class:bg-info-content={!focus && highlighted}
    class:hover:outline={!focus && !highlighted && editable}
    class:hover:outline-info={!focus && !highlighted && editable}
    class:cursor-move={editable && focus}
    bind:this={element}
>
    <div class="w-full h-full relative">
        {#if focus}
            <div 
                class="absolute rounded-sm outline outline-2 outline-primary bg-background hover:bg-primary h-2 -bottom-[5px]" 
                style="width:calc(100%/2);left:calc(100%/4)"
                class:cursor-row-resize={editable}
                on:pointerdown={e => heightDown(e)}
                on:pointermove={e => pointermove(e)}
            ></div>
            <div 
                class="absolute rounded-sm outline outline-2 outline-primary bg-background hover:bg-primary w-2 -right-[5px]" 
                style="height:calc(100%/2);top:calc(100%/4)"
                class:cursor-col-resize={editable}
                on:pointerdown={e => widthDown(e)}
                on:pointermove={e => pointermove(e)}
            ></div>
        {/if}

        <slot>
            
        </slot>
    </div>
</div>