<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import { createEventDispatcher } from 'svelte';

    import Slider from 'stwui/slider';

    const dispatcher = createEventDispatcher();

    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'item'|'view';

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

    function formatValue(v: number | null | undefined) : string | undefined | null {
        if(v === null || v === undefined) {
            return v;
        }

        if(capability.units === '%' || !capability.units) {
            return (100.0 / (capability.max - capability.min) * v).toFixed(0) + '%';
        }

        return v.toFixed(capability.decimals);
    }
</script>

{#if capability !== undefined}
    {#if mode === 'item'}
        <span class="whitespace-nowrap cursor-pointer">{formatValue(capability.value) ?? '...'} {capability.units ?? ''}</span>
    {:else}
        <div class="flex flex-col w-full">
            <div class="mx-auto">
                <div class="flex flex-col items-center">
                    <h1>{formatValue(value) ?? '...'} {capability?.units ?? ''}</h1>
                    <span>{capability.title}</span>
                </div>
            </div>

            <div class="flex flex-row mt-4">
                <span class="whitespace-nowrap mr-4">{formatValue(capability.min)} {capability.units ?? ''}</span>
                <Slider 
                    class="w-full"
                    bind:value={value}
                    min={capability.min} 
                    max={capability.max} 
                    step={capability.step ?? Math.pow(0.1, capability.decimals)}
                    disabled={disabled} 
                />
                <span class="whitespace-nowrap ml-4">{formatValue(capability.max)} {capability.units ?? ''}</span>
            </div>
        </div>
    {/if}
{/if}