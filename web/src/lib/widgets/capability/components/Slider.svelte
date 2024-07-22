<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import type { CapabilitySettings_v5 } from '../CapabilitySettings';

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'card'|'view';

    let value: number;
    $: disabled = !controllable || $editing;

    $: onCapability(capability);
    $: onValue(value);

    function onCapability(c: CapabilityObj) {
        value = c.value;
    }

    async function onValue(v: number) {
        if(v !== capability?.value) {
            if(!disabled) {
                await setCapabilityValue(v);
            }
        }
    }

    function formatValue(v: number | null | undefined) : string | undefined | null {
        if(v === null || v === undefined) {
            return v;
        }

        if(capability.units === '%' || !capability.units) {
            return (100.0 / (capability.max - capability.min) * v).toFixed(0);
        }

        return v.toFixed(capability.decimals);
    }

    async function setCapabilityValue(v: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId: capability.id,
            value: v
        });
    }
</script>

<span class="whitespace-nowrap cursor-pointer">{formatValue(value) ?? '...'} {capability.units ?? '%'}</span>