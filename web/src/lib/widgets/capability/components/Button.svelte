<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import Button from 'stwui/button';
    import type { CapabilitySettings_v5 } from '../CapabilitySettings';

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'card'|'view';

    //$: value = capability?.value;
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
            <Button type="primary" on:click={() => setValue(true)} {disabled}>{settings.title ?? capability.title}</Button>
        {:else}
            <div class="flex justify-center">
                <Button size="xl" type="primary" on:click={() => setValue(true)} {disabled}>{settings.title ?? capability.title}</Button>
            </div>
        {/if}
    </div>
{/if}