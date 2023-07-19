<script lang="ts">
    import type CapabilitySettings from './ImageSettings';
    import type { DeviceMap, Homey } from '../../types/Homey';

    export let settings: CapabilitySettings;
    export let devices: DeviceMap;
    export let editing: boolean;
    export let homey: Homey;

    $: device = devices[settings.deviceId ?? ''];
    $: image = device?.images.find(image => image.id === settings.imageId);
</script>

{#if device == undefined || image == undefined}
    <span class="header">Error</span>
{:else}
    <div class="header">
        <div>{device?.name}</div>
        <div class="subtitle">{image?.title}</div>
    </div>
{/if}

{#if device == undefined || image == undefined}
    {#if device == undefined}
        <span>Device not found.</span>
    {:else}
        <span>Image not found.</span>
    {/if}
{:else}
    {#await homey.baseUrl}
        ...
    {:then url}
        <img class="image" src={url + image.imageObj.url} alt={image.title} />
    {/await}
{/if}

<style>
.header {
    margin-left: 5px;
    font-size: small;
    height: 48px;
}

.subtitle {
    font-weight: lighter;
}

.image {
    margin: 5px;
    width: calc(100% - 10px);
    height: calc(100% - 10px - 48px);
}
</style>