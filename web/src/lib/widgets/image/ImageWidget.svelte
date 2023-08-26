<script lang="ts">
    import { devices, homey } from '$lib/stores/homey';

    import type ImageSettings from './ImageSettings';
    
    export let settings: ImageSettings;

    let refreshSlug = 0;
    let refreshClear: number | undefined;

    $: device = $devices[settings.deviceId ?? ''];
    $: image = device?.images.find(image => image.id === settings.imageId);
    $: {
        if(refreshClear !== undefined) clearInterval(refreshClear);

        if(settings.refresh !== undefined && settings.refresh > 0) {
            refreshClear = setInterval(() => { refreshSlug = Date.now(); }, settings.refresh * 1000);
        }
    }
    $: hideTitle = settings?.hideTitle ?? false;
    $: fontColor = settings?.fontColor ? settings.fontColor : 'black';
    $: fontBlur = settings?.fontBlur ?? false;
</script>

<div class="frame">
    {#if device === undefined || image === undefined}
        {#if device === undefined}
            <span>Error: device not found</span>
        {:else if image === undefined}
            <span>Error: image not found</span>
        {/if}
    {:else}
        {#if !hideTitle}
            <div class="header overlay" class:font-blur={fontBlur} style="color: {fontColor}">
                <div>{device?.name}</div>
                <div class="subtitle">{image?.title}</div>
            </div>
        {/if}

        {#await $homey.baseUrl}
            ...
        {:then url}
            <img class="image-full" src={url + image.imageObj.url + '?v=' + refreshSlug} alt={image.title + ' refreshed: ' + refreshSlug} />
        {/await}
    {/if}
</div>

<style>
.frame {
    position: relative;
    height: 100%;
    width: 100%;
}

.header {
    padding-left: 5px;
    font-size: small;
    height: 48px;
    width: calc(100% - 5px);
    color: white;
}

.overlay {
    position: absolute;
    left: 0px;
    bottom: 0px;
}

.font-blur {
    backdrop-filter: blur(6px);
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
}

.subtitle {
    font-weight: lighter;
}

.image-full {
    width: 100%;
    height: 100%;
    border-radius: 10px;
}
</style>