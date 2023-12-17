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

    let element: HTMLElement;

    let posX: number = 0;
    let posY: number = 0;

    onMount(() => {
        pointerdown(undefined);
    });

    function pointerdown(e: any) {
        pauseEvent(e);

        // Save start position
        posX = e.clientX;
        posY = e.clientY;

        dispatch('down', e);

        window.addEventListener('pointerup', pointerup);
        window.addEventListener('pointermove', pointermove);
    }

    function pointerup(e: any) {
        pauseEvent(e);

        dispatch('up', e);

        window.removeEventListener("pointermove", pointermove);
        window.removeEventListener("pointerup", pointerup);
    }

    function pointermove(e: any) {
        pauseEvent(e);

        const x = posX - e.clientX;
        const y = posY - e.clientY;
        
        posX = e.clientX;
        posY = e.clientY;

        element.style.top = (element.offsetTop - y) + 'px';
        element.style.left = (element.offsetLeft - x) + 'px';
        
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
    class="absolute outline-2 cursor-grab touch-none outline outline-primary"
    bind:this={element}
>
    <slot></slot>
</div>