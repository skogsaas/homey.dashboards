<script lang="ts">
    import { baseUrl, devices, homey } from '$lib/stores/homey';

    import type ImageSettings from './ImageSettings';
    import type { WidgetContext } from '$lib/types/Widgets';
    
    export let context: WidgetContext;
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

<div class="relative w-full">
    {#if device === undefined || image === undefined}
        {#if device === undefined && settings.deviceId !== undefined}
            <span>Device not found</span>
        {:else if image === undefined && settings.imageId !== undefined}
            <span>Image not found</span>
        {:else}
            <span>Image not configured</span>
        {/if}
    {:else}
        {#if !hideTitle}
            <div class="flex pl-2 pb-2 absolute left-0 bottom-0 w-full" class:backdrop-blur={fontBlur} style="color: {fontColor}">
                <div>{device?.name}</div>
                <div class="ml-4 font-extralight">{image?.title}</div>
            </div>
        {/if}

        {#await $homey.baseUrl}
            ...
        {:then url}
            <img class="w-full h-full" src={url + image.imageObj.url + '?v=' + refreshSlug} alt={image.title + ' refreshed: ' + refreshSlug} />
        {/await}
    {/if}
</div>