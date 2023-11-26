<script lang="ts">
    import ColorPicker from '$lib/components/ColorPicker.svelte';
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import type { CapabilitySettings_v5 } from '../CapabilitySettings';

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'card'|'view';

    $: value = capability?.value;
    $: disabled = !controllable || $editing;

    async function setValue(value: boolean) {
        await setCapabilityValue(value);
    }

    async function setCapabilityValue(value: number|boolean|string) {
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
    <div on:click={e => { if(!$editing) { e.stopPropagation(); } }}>
        {#if mode === 'card'}
            <div 
                class="w-5 h-5 rounded-full"
                style="background-color: {value};"
            >
                &nbsp;
            </div>
        {:else}
            <ColorPicker value={value} on:value={(e) => setCapabilityValue(e.detail)} mode="rgb" />
        {/if}
    </div>
{/if}