<script lang="ts">
    import ColorPicker from '$lib/components/ColorPicker.svelte';
    import { editing } from '$lib/stores/editing';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import type { CapabilitySettings_v5 } from '../CapabilitySettings';

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;

    $: value = capability?.value;
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
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div>
        {#if !controllable}
            <div 
                class="w-5 h-5 rounded-full"
                style="background-color: {value};"
            >
                &nbsp;
            </div>
        {:else}
            <ColorPicker value={value} on:value={(e) => setValue(e.detail)} mode="rgb" class="btn btn-circle w-5 h-5" />
        {/if}
    </div>
{/if}