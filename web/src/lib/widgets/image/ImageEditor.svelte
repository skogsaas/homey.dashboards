<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import Select, { Option } from "@smui/select";
    import type CapabilitySettings from "./ImageSettings";
    import type { Image, DeviceObj, DeviceMap, Homey } from '../../types/Homey';

    export let settings: CapabilitySettings;
    export let devices: DeviceMap;
    
    export let homey: Homey;

    const dispatch = createEventDispatcher();

    let device: DeviceObj | null = null;
    let image: Image | undefined;

    $: flatDevices = Object.values(devices).sort((a, b) => {
        if(a.name === b.name) return 0;
        if(a.name < b.name) return -1;
        return 1;
    });
    $: images = device?.images ? device.images : [];

    $: deviceId = onDevice(device);
    $: imageId = onImage(image);

    onMount(() => {
        if(settings.deviceId) {
            device = devices[settings.deviceId];
        }

        if(device && settings.imageId)
        {
            image = device.images.find(i => i.id === settings.imageId);
        }
    });

    function onDevice(value: DeviceObj | null) : string | null {
        if(value == null || value.id === settings.deviceId) {
            return null;
        }

        device = value;
        settings.deviceId = value.id;

        // Reset the capability after changing device
        image = undefined;
        settings.imageId = null;

        dispatch('settings', settings);

        return settings.deviceId;
    }

    function onImage(value: Image | undefined) : string | null {
        if(value == null || value.id === settings.imageId) {
            return null;
        }

        image = value;
        settings.imageId = value.id;

        dispatch('settings', settings);

        return settings.imageId;
    }
</script>

<div>
    <Select bind:value={device} label="Device">
        {#each flatDevices as flatDevice}
          <Option value={flatDevice}>{flatDevice.name}</Option>
        {/each}
    </Select>
</div>

<div>
{#if device}
    <Select bind:value={image} label="Image">
        {#each images as img}
            <Option value={img}>{img.title}</Option>
        {/each}
    </Select>
{/if}
</div>