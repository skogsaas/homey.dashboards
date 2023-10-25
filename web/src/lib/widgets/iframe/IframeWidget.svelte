<script lang="ts">
    import { editing } from '$lib/stores/dashboard';

    import type IframeSettings from './IframeSettings';

    export let settings: IframeSettings;

    $: style = getSize(settings);

    function getSize(s: IframeSettings) : string {
        let result = '';

        if(s.width !== undefined) {
            result += 'width: ' + s.width + 'px;';
        } else {
            result += 'width: 100%;'
        }

        if(s.height !== undefined) {
            result += 'height: ' + s.height + 'px;';
        } else {
            result += 'height: 100%;'
        }

        return result;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if settings.url === undefined}
    <span>Iframe not configured</span>
{:else}
    <div class="w-full h-full flex justify-center items-center" on:click={e => { if(!$editing) { e.stopPropagation(); } }}>
        <iframe style={style} title={settings.url} src={settings.url} sandbox="" />
    </div>
{/if}