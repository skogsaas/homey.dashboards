<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj } from '$lib/types/Homey';

    import Slider from '@smui/slider';
    import { createEventDispatcher } from 'svelte';

    const dispatcher = createEventDispatcher();

    export let capability: CapabilityObj;
    export let controllable: boolean;

    $: value = capability?.value;
    $: disabled = !controllable || $editing;

    function setValue(value: boolean) {
        dispatcher('value', value);
    }
</script>

{#if capability !== null && capability !== undefined}
    <Slider 
        style="flex-grow: 1; align-self: center;" 
        value={value} 
        on:SMUISlider:change={(e) => setValue(e.detail.value)} 
        min={capability.min} 
        max={capability.max} 
        step={Math.pow(10, -1 * capability.decimals)} 
        discrete 
        disabled={disabled} 
    />
{:else}
    Null
{/if}