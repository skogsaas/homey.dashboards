<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import { formatDistance } from 'date-fns'

    import Toggle from '$lib/components/boolean/Toggle.svelte';
    import { createEventDispatcher } from 'svelte';
    import type { CapabilitySettings_v5 } from '../CapabilitySettings';
    import Icon from '$lib/components/Icon.svelte'
    import { getIcon } from '$lib/components/icons/utils';

    const dispatcher = createEventDispatcher();

    export let settings: CapabilitySettings_v5;
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
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click|stopPropagation>
            <Toggle bind:value={value} />
        </div>
    {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="flex items-center w-full" on:click|stopPropagation>
            {#if settings.iconId !== undefined}
                <Icon data={getIcon(settings.iconId)} class="mr-1" />
            {/if}
            <h3>{settings.title ?? capability.title}</h3>
            <span class="font-extralight ml-2 text-xs mr-auto">{formatDistance(new Date(capability.lastUpdated), new Date(), { addSuffix: true })}</span>

            <Toggle bind:value={value} />
        </div>
    {/if}
{/if}