<script lang="ts">
    import { onMount } from 'svelte';

    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import type { CapabilitySettings_v5 } from '../CapabilitySettings';

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;

    let value: string | undefined;
    $: disabled = !controllable || $editing;

    $: onValue(value);

    onMount(() => {
        value = capability.value;
    })

    async function onValue(v: string | undefined) {
        if(capability.setable &&  v !== capability?.value && v !== undefined) {
            if(!disabled) {
                await setCapabilityValue(v);
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
    
    <span class="whitespace-nowrap">{capability.value ?? '...'} {capability.units ?? ''}</span>
{/if}