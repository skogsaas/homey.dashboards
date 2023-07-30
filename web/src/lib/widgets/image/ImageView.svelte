<script lang="ts">
    import { devices, homey } from '$lib/stores/homey';

    import type CapabilitySettings from './ImageSettings';
    
    export let settings: CapabilitySettings;

    let refreshSlug = 0;
    let refreshClear: number | undefined;

    $: device = $devices[settings.deviceId ?? ''];
    $: image = device?.images.find(image => image.id === settings.imageId);
    $: {
        if(refreshClear !== undefined) clearInterval(refreshClear);

        if(settings.refresh !== null && settings.refresh > 0) {
            refreshClear = setInterval(() => { refreshSlug = Date.now(); }, settings.refresh * 1000);
        }
    }
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
    {#await $homey.baseUrl}
        ...
    {:then url}
        <div class="image-container">
            <img class="image" src={url + image.imageObj.url + '?v=' + refreshSlug} alt={image.title + ' refreshed: ' + refreshSlug} />
        </div>
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

.image-container {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
}

.image {
    margin: 5px;
    max-width: calc(100% - 10px);
    max-height: calc(100% - 10px - 48px);
    object-fit: cover;
}
</style>