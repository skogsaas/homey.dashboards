<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { devices } from '$lib/stores/homey';

    import type ImageSettings from "./ImageSettings";

    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import type { DeviceObj, Image } from '$lib/types/Homey';

    export let settings: ImageSettings;

    const dispatch = createEventDispatcher();

    let deviceId: string | undefined;
    let imageId: string | undefined;
    let refresh: number;
    let hideTitle: boolean;
    let fontColor: string;
    let fontBlur: boolean;

    const deviceFilter = (device: DeviceObj) => device.images.length > 0;

    let images: Image[] = [];

    $: onSettings(settings);

    $: onDevice(deviceId);
    $: onChanges(deviceId, imageId, refresh, hideTitle, fontColor, fontBlur);
    
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

    function onChanges(
        _deviceId: string | undefined,
        _imageId: string | undefined,
        _refresh: number,
        _hideTitle: boolean,
        _fontColor: string,
        _fontBlur: boolean
    ) {
        if(_deviceId !== settings.deviceId ||
            _imageId !== settings.imageId ||
            _refresh !== settings.refresh ||
            _hideTitle !== settings.hideTitle ||
            _fontColor !== settings.fontColor ||
            _fontBlur !== settings.fontBlur
        ) {
            settings = {
                ...settings,
                deviceId: _deviceId,
                imageId: _imageId,
                refresh: _refresh,
                hideTitle: _hideTitle,
                fontColor: _fontColor,
                fontBlur: _fontBlur
            };

            dispatch('settings', settings);
        }
    }

    function onDevice(_deviceId: string | undefined) {
        if(_deviceId === undefined) {
            images = [];
            return;
        }

        images = $devices[_deviceId].images;
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