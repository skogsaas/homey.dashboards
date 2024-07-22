<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import type { CapabilitySettings_v5 } from '../CapabilitySettings';

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;

    //$: value = capability?.value;
    $: disabled = !controllable || $editing;

    async function setValue(value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId: capability.id,
            value
        });
    }
</script>

{#if capability}
    <button class="btn btn-primary" on:click={() => setValue(true)} {disabled}>
        {settings.title ?? capability.title}
    </button>
{/if}