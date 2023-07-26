<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import Select, { Option } from "@smui/select";
    import type ImageSettings from "./ImageSettings";
    import type { Image, DeviceObj, DeviceMap, Homey } from '../../types/Homey';

    export let settings: ImageSettings;
    export let devices: DeviceMap;
    
    export let homey: Homey;

    const dispatch = createEventDispatcher();

    let device: DeviceObj | null = null;
    let image: Image | undefined;
    let refresh: number = 0;

    $: imageDevices = Object.values(devices)
        .filter(d => d.images.length > 0)
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });
    $: images = device?.images ? device.images : [];

    $: onDevice(device);
    $: onImage(image);
    $: onRefresh(refresh);

    onMount(() => {
        if(settings.deviceId) {
            device = devices[settings.deviceId];
        }

        if(device && settings.imageId) {
            image = device.images.find(i => i.id === settings.imageId);
        }

        refresh = settings?.refresh ?? 0;
    });

    function onDevice(value: DeviceObj | null) {
        if(value == null || value.id === settings.deviceId) {
            return null;
        }

        device = value;
        settings.deviceId = value.id;

        // Reset the capability after changing device
        image = undefined;
        settings.imageId = null;

        dispatch('settings', settings);
    }

    function onImage(value: Image | undefined) {
        if(value == null || value.id === settings.imageId) {
            return null;
        }

        image = value;
        settings.imageId = value.id;

        dispatch('settings', settings);
    }

    function onRefresh(value: number) {
        if(value !== settings.refresh) {
            settings.refresh = value;

            dispatch('settings', settings);
        }
    }
</script>

<div>
    <Select bind:value={device} label="Device">
        {#each imageDevices as imageDevice}
          <Option value={imageDevice}>{imageDevice.name}</Option>
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

<Select bind:value={refresh} label="Refresh every">
    <Option value={0}>Never</Option>
    <Option value={5}>5 seconds</Option>
    <Option value={15}>15 seconds</Option>
    <Option value={30}>30 seconds</Option>
    <Option value={60}>1 minute</Option>
    <Option value={300}>5 minutes</Option>
    <Option value={600}>10 minutes</Option>
    <Option value={1800}>30 minutes</Option>
    <Option value={3600}>1 hour</Option>
    <Option value={21600}>6 hour</Option>
    <Option value={43200}>12 hour</Option>
    <Option value={86400}>24 hour</Option>
</Select>