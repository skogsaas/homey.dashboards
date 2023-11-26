<script lang="ts">
    import { editing } from '$lib/stores/dashboard';

    import type IframeSettings from './IframeSettings';

    export let settings: IframeSettings;
    export let context: WidgetContext;

    $: style = getSize(settings);
    $: sandbox = getSandbox(settings);

    function getSize(s: IframeSettings) : string {
        let result = '';

        if(s.width) {
            result += 'width: ' + s.width + 'px;';
        } else {
            result += 'width: 100%;'
        }

        if(s.height) {
            result += 'height: ' + s.height + 'px;';
        } else {
            result += 'height: 100%;'
        }

        return result;
    }

    function getSandbox(s: IframeSettings) : string {
        let result = '';

        if(s.allowForms) {
            result += 'allow-forms ';
        }

        if(s.allowModals) {
            result += 'allow-modals ';
        }

        if(s.allowOrientationLock) {
            result += 'allow-orientation-lock ';
        }

        if(s.allowPopups) {
            result += 'allow-popups ';
        }

        if(s.allowPopupsToEscapeSandbox) {
            result += 'allow-popups-to-escape-sandbox ';
        }

        if(s.allowPresentation) {
            result += 'allow-presentation ';
        }

        if(s.allowSameOrigin) {
            result += 'allow-same-origin ';
        }

        if(s.allowScripts) {
            result += 'allow-scripts ';
        }

        if(s.allowTopNavigation) {
            result += 'allow-top-navigation ';
        }

        if(s.allowTopLevelNavigationByUserActivation) {
            result += 'allow-top-navigation-by-user-activation ';
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
        <iframe style={style} title={settings.url} src={settings.url} sandbox={sandbox} />
    </div>
{/if}