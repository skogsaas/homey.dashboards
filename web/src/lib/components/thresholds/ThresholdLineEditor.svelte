<script lang="ts">
    import ColorPicker from "../ColorPicker.svelte";

    import { createEventDispatcher } from "svelte";

    export let color: string;
    export let value: number;
    export let colorMode: 'rgb'|'rgba';
    export let base: boolean;

    export let min: number;
    export let max: number;

    let _color: string;
    let _value: number;

    let error: string | undefined = undefined;

    const dispatch = createEventDispatcher();

    $: onChanges(color, value);
    $: onColor(_color);
    $: onValue(_value);

    function onChanges(c: string, v: number) {
        if(c !== _color) _color = c;
        if(v !== _value) _value = v;
    }

    function onColor(c: string) {
        dispatch('color', c);
    }

    function onValue(v: number) {

        if(Number.isNaN(v)) {
            error = v + ' is not a valid number';
        } else if (v < min) {
            error = 'Must be greater than ' + min;
        } else if (v > max) {
            error = 'Must be less or equal to ' + max;
        } else {
            error = undefined;
            dispatch('value', v);
        }
    }

</script>

<div class="join w-full flex">    
    <ColorPicker bind:value={_color} mode={colorMode} class="join-item border-solid w-10" />
    
    {#if !base}
        <input class="input join-item" type="number" bind:value={_value} />
    {:else}
        <input class="input join-item" type="text" name="value" value="base" readonly />
    {/if}
</div>