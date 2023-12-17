<script lang="ts">

    import { createEventDispatcher, onMount } from "svelte";

    export let columns: number;
    export let rowHeight: number;
    
    export let x: number;
    export let y: number;
    export let h: number;
    export let w: number;

    $: top = 'top:' + rowHeight * y + 'px;';
    $: left = 'left:calc(100% / ' + columns + ' * ' + x + ');';
    
    $: height = 'height:' + rowHeight * h + 'px;';
    $: width = 'width:calc(100% / ' + columns + ' * ' + w + ');';

</script>

<div
    class="absolute bg-primary/20"
    style={top + left + height + width}
>
</div>