<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj } from '$lib/types/Homey';

    import Slider from '$lib/components/Slider.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatcher = createEventDispatcher();

    export let capability: CapabilityObj;
    export let controllable: boolean;

    let value: number;
    $: disabled = !controllable || $editing;

    $: onCapability(capability);
    $: onValue(value);

    function onCapability(c: CapabilityObj) {
        value = c.value;
    }

    function onValue(v: number) {
        if(v !== capability?.value) {
            if(!disabled) {
                dispatcher('value', v);
            }
        }
    }
</script>

{#if capability !== null && capability !== undefined}
    <Slider 
        style="flex-grow: 1; align-self: center;"
        bind:value={value}
        min={capability.min} 
        max={capability.max} 
        step={Math.pow(10, -1 * capability.decimals)} 
        disabled={disabled} 
    />
{:else}
    Null
{/if}