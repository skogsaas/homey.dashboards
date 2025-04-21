<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { devices, homey } from '$lib/stores/homey';

    // UI elements
    import DevicePicker from '$lib/components/DevicePicker.svelte';

    import type { DeviceObj } from '$lib/types/Homey';
    import type { DeviceSettings_v1 } from './DeviceSettings';
    import IconPicker from '$lib/components/IconPicker.svelte';
    import TextPicker from '$lib/components/TextPicker.svelte';

    const dispatch = createEventDispatcher();
    
    export let settings: DeviceSettings_v1;

    let deviceId: string | undefined;
    let title: string | undefined;
    let iconId: string | undefined;

    let device: DeviceObj | undefined;

    $: onSettings(settings);

    $: device = deviceId ? $devices[deviceId] : undefined;

    $: onDevice(deviceId);
    $: onTitle(title);
    $: onIcon(iconId);

    function onSettings(s: DeviceSettings_v1) {
        deviceId = s?.deviceId;
        title = s?.title;
        iconId = s?.iconId;
    }

    function onDevice(id: string | undefined) {
        if(id !== settings.deviceId) {
            dispatch('settings', { ...settings, deviceId: id, capabilityId: undefined });
        }
    }

    function onTitle(t: string | undefined) {
        const value = t !== undefined && t.length > 0 ? t : undefined;

        if(value !== settings.title) {
            dispatch('settings', { ...settings, title: value });
        }
    }

    function onIcon(id: string | undefined) {
        if(id !== settings.iconId) {
            dispatch('settings', { ...settings, iconId: id });
        }
    }
</script>

<DevicePicker bind:deviceId={deviceId} />

{#if device}
    <TextPicker bind:value={title} placeholder={device.name} label="Title" />
{/if}

<IconPicker bind:iconId={iconId} />