<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { devices } from '$lib/stores/homey';

    import type ImageSettings from "./ImageSettings";

    import Select from 'stwui/select';
    import Toggle from 'stwui/toggle';

    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import type { DeviceObj, ImageObj } from '$lib/types/Homey';

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
    let imageId: Option | undefined;
    let refresh: Option;
    let hideTitle: boolean;
    let fontColor: Option;
    let fontBlur: boolean;

    const deviceFilter = (device: DeviceObj) => device.images.length > 0;

    $: imageDevices = (Object.values($devices) ?? [])
        .filter(d => d.images.length > 0)
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });

    let images: Option[] = [];

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
                imageId = { value: image.id, label: image.title };
            }
        }
        
        refresh = refreshOptions.find(r => Number(r.value) === (settings?.refresh ?? 0)) ?? refreshOptions[0];
        hideTitle = settings?.hideTitle ?? false;
        fontColor = colorOptions.find(c => c.value === (settings?.fontColor ?? 'black')) ?? colorOptions[0];
        fontBlur = settings?.fontBlur ?? false;
    }

    function onDevice(value: string | undefined) {
        if(value === undefined) {
            return;
        }

        images = $devices[value].images
            .map(i => ({ value: i.id, label: i.title }));

        if(value === settings.deviceId) {
            return;
        }

        // Reset the capability after changing device
        imageId = undefined;
        
        const s: ImageSettings = { ...settings, deviceId, imageId };
        dispatch('settings', s);
    }

    function onImage(option: Option | undefined) {
        if(option === undefined || option.value === settings.imageId) {
            return;
        }

        const s: ImageSettings = { ...settings, imageId: option.value };
        dispatch('settings', s);
    }

    function onRefresh(option: Option) {
        if(Number(option.value) !== settings.refresh) {
            const s: ImageSettings = { ...settings, refresh: Number(option.value) };
            dispatch('settings', s);
        }
    }

    function onHideTitle(value: boolean) {
        if(value !== settings.hideTitle) {
            const s: ImageSettings = { ...settings, hideTitle: value };
            dispatch('settings', s);
        }
    }

    function onFontColor(option: Option) {
        if(option.value !== settings.fontColor) {
            const s: ImageSettings = { ...settings, fontColor: option.value };
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

<div>
{#if deviceId}
    <Select 
        bind:value={imageId} 
        placeholder="Image"
        name="imageId"
    >
        <Select.Options slot="options">
            {#each images as option}
                <Select.Options.Option {option} />
            {/each}
        </Select.Options>
        
    </Select>
{/if}
</div>

<Select 
    bind:value={refresh} 
    placeholder="Refresh every"
    name="refresh"
>
    <Select.Options slot="options">
        {#each refreshOptions as option}
            <Select.Options.Option {option} />
        {/each}
    </Select.Options>
</Select>

<Toggle
    name="hideTitle"
    bind:on={hideTitle}
>
    <Toggle.ContentRight slot="content-right">
        <Toggle.ContentRight.Label slot="label">Hide title</Toggle.ContentRight.Label>
    </Toggle.ContentRight>
</Toggle>

{#if !hideTitle}
    <Toggle
        name="fontBlur"
        bind:on={fontBlur}
    >
        <Toggle.ContentRight slot="content-right">
            <Toggle.ContentRight.Label slot="label">Blur background</Toggle.ContentRight.Label>
        </Toggle.ContentRight>
    </Toggle>

    <Select 
        bind:value={fontColor} 
        placeholder="Font color"
        name="fontColor"
    >
        <Select.Options slot="options">
            {#each colorOptions as option}
                <Select.Options.Option {option} />
            {/each}
        </Select.Options>
    </Select>
{/if}