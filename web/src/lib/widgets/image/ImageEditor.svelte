<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { devices } from '$lib/stores/homey';

    import Select, { Option } from "@smui/select";
    import FormField from '@smui/form-field';
    import Checkbox from '@smui/checkbox';
    import type ImageSettings from "./ImageSettings";

    export let settings: ImageSettings;

    const dispatch = createEventDispatcher();

    let deviceId: string | undefined;
    let imageId: string | undefined;
    let refresh: number;
    let fontColor: string;
    let fontBlur: boolean;

    $: onSettings(settings);

    $: imageDevices = (Object.values($devices) ?? [])
        .filter(d => d.images.length > 0)
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });
    $: images = deviceId ? $devices[deviceId].images : [];

    $: onDevice(deviceId);
    $: onImage(imageId);
    $: onRefresh(refresh);
    $: onFontColor(fontColor);
    $: onFontBlur(fontBlur);

    function onSettings(s: ImageSettings) {
        deviceId = settings.deviceId;
        imageId = settings.imageId;

        refresh = settings?.refresh ?? 0;
        fontColor = settings?.fontColor ?? 'black';
        fontBlur = settings?.fontBlur ?? false;
    }

    function onDevice(value: string | undefined) {
        if(value === undefined || value === settings.deviceId) {
            return;
        }

        // Reset the capability after changing device
        imageId = undefined;
        
        const s: ImageSettings = { ...settings, deviceId, imageId };
        dispatch('settings', s);
    }

    function onImage(value: string | undefined) {
        if(value === undefined || value === settings.imageId) {
            return;
        }

        const s: ImageSettings = { ...settings, imageId };
        dispatch('settings', s);
    }

    function onRefresh(value: number) {
        if(value !== settings.refresh) {
            const s: ImageSettings = { ...settings, refresh: value };
            dispatch('settings', s);
        }
    }

    function onFontColor(value: string) {
        if(value !== settings.fontColor) {
            const s: ImageSettings = { ...settings, fontColor: value };
            dispatch('settings', s);
        }
    }

    function onFontBlur(value: boolean) {
        if(value !== settings.fontBlur) {
            const s: ImageSettings = { ...settings, fontBlur: value };
            dispatch('settings', s);
        }
    }
</script>

<div>
    <Select 
        bind:value={deviceId} 
        label="Device"
    >
        {#each imageDevices as imageDevice}
          <Option value={imageDevice.id}>{imageDevice.name}</Option>
        {/each}
    </Select>
</div>

<div>
{#if deviceId}
    <Select 
        bind:value={imageId} 
        label="Image"
    >
        {#each images as img}
            <Option value={img.id}>{img.title}</Option>
        {/each}
    </Select>
{/if}
</div>

<Select 
    bind:value={refresh} 
    label="Refresh every"
>
    <Option value="0">Never</Option>
    <Option value="5">5 seconds</Option>
    <Option value="15">15 seconds</Option>
    <Option value="30">30 seconds</Option>
    <Option value="60">1 minute</Option>
    <Option value="300">5 minutes</Option>
    <Option value="600">10 minutes</Option>
    <Option value="1800">30 minutes</Option>
    <Option value="3600">1 hour</Option>
    <Option value="21600">6 hour</Option>
    <Option value="43200">12 hour</Option>
    <Option value="86400">24 hour</Option>
</Select>

<Select 
    bind:value={fontColor} 
    label="Font color"
>
    <Option value="black">Black</Option>
    <Option value="white">White</Option>
    <Option value="red">Red</Option>
    <Option value="green">Green</Option>
    <Option value="blue">Blue</Option>
</Select>

<FormField>
    <span slot="label">Blur background</span>
    <Checkbox bind:checked={fontBlur} />
</FormField>