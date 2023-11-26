<script lang="ts">
    import { Input } from "stwui";
    import ColorPicker from "../ColorPicker.svelte";

    import { createEventDispatcher } from "svelte";

    export let color: string;
    export let value: number;
    export let colorMode: 'rgb'|'rgba';
    export let base: boolean;

    export let min: number;
    export let max: number;

    let _color: string;
    let _value: string;

    let error: string | undefined = undefined;

    const dispatch = createEventDispatcher();

    $: onChanges(color, value);
    $: onColor(_color);
    $: onValue(_value);

    function onChanges(c: string, v: number) {
        if(c !== _color) _color = c;

        if(v.toString() !== _value) _value = v.toString();
    }

    function onColor(c: string) {
        dispatch('color', c);
    }

    function onValue(v: string) {
        const num: number = Number.parseFloat(v)

        if(Number.isNaN(num)) {
            error = v + ' is not a valid number';
        } else if (num < min) {
            error = 'Must be greater than ' + min;
        } else if (num > max) {
            error = 'Must be less or equal to ' + max;
        } else {
            error = undefined;
            dispatch('value', num);
        }
    }

</script>

<div class="flex flex-row justify-between my-2 flex-grow mr-2 h-11 items-center">    
    <ColorPicker bind:value={_color} mode={colorMode} />
    
    {#if !base}
        <Input name="value" bind:value={_value} error={error} class="mt-0" />
    {:else}
        <Input name="value" value="base" readonly />
    {/if}
</div>