<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { devices, homey } from '$lib/stores/homey';

    // UI elements
    import DevicePicker from '$lib/components/DevicePicker.svelte';

    // Tailwind
    import Input from 'stwui/input';
    import Toggle from 'stwui/toggle';

    import type SliderSettings from "./SliderSettings";
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';

    const dispatch = createEventDispatcher();
    
    export let settings: SliderSettings;

    let deviceId: string | undefined;
    let capabilityId: string | undefined;
    let title: string | undefined;
    let hideMinMax: boolean = false;

    let device: DeviceObj | undefined;

    $: onSettings(settings);

    $: device = deviceId ? $devices[deviceId] : undefined;
    $: capability = device?.capabilitiesObj ? device.capabilitiesObj[capabilityId ?? ''] : undefined;

    $: flatDevices = Object.values($devices)
            .filter(d => Object.values(d.capabilitiesObj)
                .some(c => 
                    c.setable &&
                    c.type === 'number' && 
                    c.min !== undefined && 
                    c.max !== undefined
                ));
    $: flatCapabilities = (device?.capabilitiesObj ? Object.values(device.capabilitiesObj) : [])
            .filter(c => 
                    c.setable &&
                    c.type === 'number' && 
                    c.min !== undefined && 
                    c.max !== undefined)
            .sort((a, b) => {
                if(a.title === b.title) return 0;
                if(a.title < b.title) return -1;
                return 1;
            });

    $: onDevice(deviceId);
    $: onCapability(capabilityId);
    $: onTitle(title);
    $: onHideMinMax(hideMinMax);

    function onSettings(s: SliderSettings) {
        deviceId = s?.deviceId;
        capabilityId = s?.capabilityId;
        title = s?.title;
        hideMinMax = s?.hideMinMax ?? false;
    }

    function onDevice(id: string | undefined) {
        if(id !== undefined && id !== settings.deviceId) {
            dispatch('settings', { ...settings, deviceId: id, capabilityIds: [] });
        }
    }

    function onCapability(id: string | undefined) {
        if(id !== undefined && id !== settings.capabilityId) {
            dispatch('settings', { ...settings, capabilityId });
        }
    }

    function onTitle(t: string | undefined) {
        if(t !== settings.title) {
            dispatch('settings', { ...settings, title });
        }
    }

    function onHideMinMax(hide: boolean) {
        if(hide !== settings.hideMinMax) {
            dispatch('settings', { ...settings, hideMinMax: hide });
        }
    }
</script>

<DevicePicker bind:deviceId={deviceId} devices={flatDevices} />

{#if device}
    <div class="pt-4">
        <CapabilityPicker bind:capabilityId={capabilityId} capabilities={flatCapabilities} />
    </div>
{/if}

{#if capability}
    <Input class="pt-4" name="title" bind:value={title} placeholder={capability.title} />

    <div class="pt-4">
        <Toggle
            name="hideMinMax"
            bind:on={hideMinMax}
        >
            <Toggle.ContentRight slot="content-right">
                <Toggle.ContentRight.Label slot="label">Hide min max</Toggle.ContentRight.Label>
            </Toggle.ContentRight>
        </Toggle>
    </div>
{/if}