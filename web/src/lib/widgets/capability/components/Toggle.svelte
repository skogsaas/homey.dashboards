<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import { formatDistance } from 'date-fns'

    import Toggle from 'stwui/toggle';
    import { createEventDispatcher } from 'svelte';
    import type { CapabilitySettings_v4 } from '../CapabilitySettings';

    const dispatcher = createEventDispatcher();

    export let settings: CapabilitySettings_v4;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'card'|'view';
    
    let value: boolean;
    $: disabled = !controllable || $editing;

    $: onCapability(capability);
    $: onValue(value);

    function onCapability(c: CapabilityObj) {
        value = c.value;
    }

    async function onValue(v: boolean) {
        if(v !== capability?.value) {
            if(!disabled) {
                await setCapabilityValue(v)
            } else {
                value = !v;
            }
        }
    }

    async function setCapabilityValue(value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId: capability.id,
            value
        });
    }
</script>

{#if capability !== undefined}
    {#if mode === 'card'}
        <Toggle
            name="toggle"
            bind:on={value}
        />
    {:else}
        <div class="flex items-center w-full">
            <h3>{settings.title ?? capability.title}</h3>
            <span class="font-extralight ml-2 text-xs mr-auto">{formatDistance(new Date(capability.lastUpdated), new Date(), { addSuffix: true })}</span>

            <Toggle
                name="toggle"
                bind:on={value}
            />
        </div>
    {/if}
{/if}