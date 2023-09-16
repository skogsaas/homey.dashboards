<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import { formatDistance } from 'date-fns'

    import Toggle from 'stwui/toggle';
    import { createEventDispatcher } from 'svelte';

    const dispatcher = createEventDispatcher();

    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'item'|'view';
    
    let value: boolean;
    $: disabled = !controllable || $editing;

    $: onCapability(capability);
    $: onValue(value);

    function onCapability(c: CapabilityObj) {
        value = c.value;
    }

    function onValue(v: boolean) {
        if(v !== capability?.value) {
            if(!disabled) {
                dispatcher('value', v);
            }
        }
    }
</script>

{#if capability !== undefined}
    {#if mode === 'item'}
        <Toggle
            name="toggle"
            bind:on={value}
        />
    {:else}
        <div class="flex flex-col w-full">
            <Toggle
                name="toggle"
                bind:on={value}
            />

            <span>{capability.title}</span>
            <span class="font-extralight">{formatDistance(new Date(capability.lastUpdated), new Date(), { addSuffix: true })}</span>
        </div>
    {/if}
{/if}