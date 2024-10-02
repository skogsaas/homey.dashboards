<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { devices } from '$lib/stores/homey';

    import type ImageSettings from "./ImageSettings";

    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import type { DeviceObj, Image } from '$lib/types/Homey';

    export let settings: ImageSettings;

    const dispatch = createEventDispatcher();

    interface Option {
        value: string;
        label: string;
    }

    const refreshOptions = [
        { value: '0', label: 'Never' },
        { value: '1', label: '1 second' },
        { value: '5', label: '5 seconds' },
        { value: '15', label: '15 seconds' },
        { value: '30', label: '30 seconds' },
        { value: '60', label: '1 minute' },
        { value: '300', label: '5 minutes' },
        { value: '600', label: '10 minutes' },
        { value: '1800', label: '30 minutes' },
        { value: '3600', label: '1 hour' },
        { value: '21600', label: '6 hour' },
        { value: '43200', label: '12 hour' },
        { value: '86400', label: '24 hour' },
    ];

    const colorOptions = [
        { value: 'black', label: 'Black' },
        { value: 'white', label: 'White' },
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
    ];

    let deviceId: string | undefined;
    let imageId: string | undefined;
    let refresh: number;
    let hideTitle: boolean;
    let fontColor: string | undefined;
    let fontBlur: boolean;

    const deviceFilter = (device: DeviceObj) => device.images.length > 0;

    let images: Image[] = [];

    $: onSettings(settings);

    $: onDevice(deviceId);
    $: onImage(imageId);
    $: onRefresh(refresh);
    $: onHideTitle(hideTitle);
    $: onFontColor(fontColor);
    $: onFontBlur(fontBlur);

    function onSettings(s: ImageSettings) {
        deviceId = settings?.deviceId;

        if(deviceId) {
            const image = ($devices[deviceId].images ?? []).find(i => i.id === settings?.imageId);

            if(image !== undefined) {
                imageId = image.id;
            }
        }
        
        refresh = settings?.refresh ?? 0;
        hideTitle = settings?.hideTitle ?? false;
        fontColor = settings?.fontColor ?? 'black';
        fontBlur = settings?.fontBlur ?? false;
    }

    function onDevice(_deviceId: string | undefined) {
        if(_deviceId === undefined) {
            return;
        }

        images = $devices[_deviceId].images;

        if(_deviceId === settings.deviceId) {
            return;
        }

        // Reset the capability after changing device

        if(images.length === 1) {
            imageId = images[0].id;
        } else {
            imageId = undefined;
        }
        
        const s: ImageSettings = { ...settings, deviceId, imageId };
        dispatch('settings', s);
    }

    function onImage(_imageId: string | undefined) {
        if(_imageId === undefined || _imageId === settings.imageId) {
            return;
        }

        const s: ImageSettings = { ...settings, imageId: _imageId };
        dispatch('settings', s);
    }

    function onRefresh(_refresh: number) {
        if(_refresh !== settings.refresh) {
            const s: ImageSettings = { ...settings, refresh: _refresh };
            dispatch('settings', s);
        }
    }

    function onHideTitle(value: boolean) {
        if(value !== settings.hideTitle) {
            const s: ImageSettings = { ...settings, hideTitle: value };
            dispatch('settings', s);
        }
    }

    function onFontColor(_color: string | undefined) {
        if(_color !== settings.fontColor) {
            const s: ImageSettings = { ...settings, fontColor: _color };
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

<DevicePicker bind:deviceId={deviceId} {deviceFilter} />

{#if deviceId}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Image</span>
        </div>
        <select class="select" bind:value={imageId}>
            {#each images as image}
                <option value={image.id}>{image.title}</option>
            {/each}
        </select>
    </label>
{/if}

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Refresh every</span>
    </div>
    <select class="select" bind:value={refresh}>
        <option value="0">Never</option>
        <option value="1">1 second</option>
        <option value="5">5 seconds</option>
        <option value="15">15 seconds</option>
        <option value="30">30 seconds</option>
        <option value="60">1 minute</option>
        <option value="300">5 minutes</option>
        <option value="600">10 minutes</option>
        <option value="1800">30 minutes</option>
        <option value="3600">1 hour</option>
        <option value="21600">6 hour</option>
        <option value="43200">12 hour</option>
        <option value="86400">24 hour</option>
    </select>
</label>

<div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Hide title</span> 
      <input type="checkbox" class="toggle" bind:checked={hideTitle} />
    </label>
</div>

{#if !hideTitle}
    <div class="form-control">
        <label class="label cursor-pointer">
        <span class="label-text">Blur background</span> 
        <input type="checkbox" class="toggle" bind:checked={fontBlur} />
        </label>
    </div>

    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Color</span>
        </div>
        <select class="select" bind:value={fontColor}>
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
        </select>
    </label>
{/if}