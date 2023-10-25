<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type IframeSettings from "./IframeSettings";

    import { Input, InputNumber } from 'stwui';

    export let settings: IframeSettings;

    const dispatch = createEventDispatcher();

    let url: string | undefined;
    let height: number | undefined;
    let width: number | undefined;

    $: onSettings(settings);
    $: onChange(url, height, width);
    
    function onSettings(s: IframeSettings) {
        url = s?.url;
        height = s?.height;
        width = s?.width;
    }

    function onChange(_url: string | undefined, _height: number | undefined, _width: number | undefined) {
        if(_url !== settings.url || _height !== settings.height || _width !== settings.width) {
            dispatch('settings', { ...settings, url: _url, height: _height, width: _width });
        }
    }
</script>

<Input name="url" bind:value={url} placeholder="Url" />

<InputNumber name="height" bind:value={height} placeholder="Height" />
<InputNumber name="width" bind:value={width} placeholder="Width" />