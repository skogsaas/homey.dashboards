<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type IframeSettings from "./IframeSettings";

    import { Input, InputNumber, Toggle } from 'stwui';

    export let settings: IframeSettings;

    const dispatch = createEventDispatcher();

    let url: string | undefined;
    let height: number | undefined;
    let width: number | undefined;

    let allowForms: boolean | undefined;
    let allowModals: boolean | undefined;
    let allowOrientationLock: boolean | undefined;
    let allowPointerLock: boolean | undefined;
    let allowPopups: boolean | undefined;
    let allowPopupsToEscapeSandbox: boolean | undefined;
    let allowPresentation: boolean | undefined;
    let allowSameOrigin: boolean | undefined;
    let allowScripts: boolean | undefined;
    let allowTopNavigation: boolean | undefined;
    let allowTopLevelNavigationByUserActivation: boolean | undefined;

    $: onSettings(settings);
    $: onChange(url, 
                height, 
                width, 
                allowForms,
                allowModals,
                allowOrientationLock,
                allowPointerLock,
                allowPopups,
                allowPopupsToEscapeSandbox,
                allowPresentation,
                allowSameOrigin,
                allowScripts,
                allowTopNavigation,
                allowTopLevelNavigationByUserActivation);
    
    function onSettings(s: IframeSettings) {
        url = s?.url;
        height = s?.height;
        width = s?.width;
        allowForms = s?.allowForms;
        allowModals = s?.allowModals;
        allowOrientationLock = s?.allowOrientationLock;
        allowPointerLock = s?.allowPointerLock;
        allowPopups = s?.allowPopups;
        allowPopupsToEscapeSandbox = s?.allowPopupsToEscapeSandbox;
        allowPresentation = s?.allowPresentation;
        allowSameOrigin = s?.allowSameOrigin;
        allowScripts = s?.allowScripts;
        allowTopNavigation = s?.allowTopNavigation;
        allowTopLevelNavigationByUserActivation = s?.allowTopLevelNavigationByUserActivation;
    }

    function onChange(
        _url: string | undefined, 
        _height: number | undefined, 
        _width: number | undefined,
        _allowForms: boolean | undefined,
        _allowModals: boolean | undefined,
        _allowOrientationLock: boolean | undefined,
        _allowPointerLock: boolean | undefined,
        _allowPopups: boolean | undefined,
        _allowPopupsToEscapeSandbox: boolean | undefined,
        _allowPresentation: boolean | undefined,
        _allowSameOrigin: boolean | undefined,
        _allowScripts: boolean | undefined,
        _allowTopNavigation: boolean | undefined,
        _allowTopLevelNavigationByUserActivation: boolean | undefined
    ) {
        if(_url !== settings.url || 
            _height !== settings.height || 
            _width !== settings.width ||
            _allowForms !== settings.allowForms ||
            _allowModals !== settings.allowModals ||
            _allowOrientationLock !== settings.allowOrientationLock ||
            _allowPointerLock !== settings.allowPointerLock ||
            _allowPopups !== settings.allowPopups ||
            _allowPopupsToEscapeSandbox !== settings.allowPopupsToEscapeSandbox ||
            _allowPresentation !== settings.allowPresentation ||
            _allowSameOrigin !== settings.allowSameOrigin ||
            _allowScripts !== settings.allowScripts ||
            _allowTopNavigation !== settings.allowTopNavigation ||
            _allowTopLevelNavigationByUserActivation !== settings.allowTopLevelNavigationByUserActivation
        ) {
            dispatch('settings', 
                { ...settings, 
                    url: _url, 
                    height: _height, 
                    width: _width,
                    allowForms: _allowForms,
                    allowModals: _allowModals,
                    allowOrientationLock: _allowOrientationLock,
                    allowPointerLock: _allowPointerLock,
                    allowPopups: _allowPopups,
                    allowPopupsToEscapeSandbox: _allowPopupsToEscapeSandbox,
                    allowPresentation: _allowPresentation,
                    allowSameOrigin: _allowSameOrigin,
                    allowScripts: _allowScripts,
                    allowTopNavigation: _allowTopNavigation,
                    allowTopLevelNavigationByUserActivation: _allowTopLevelNavigationByUserActivation
                 });
        }
    }
</script>

<Input name="url" bind:value={url} placeholder="Url" />

<InputNumber name="height" bind:value={height} placeholder="Height" />
<InputNumber name="width" bind:value={width} placeholder="Width" />

<p class="m-4">
    The iframe is by default completly sandboxed. This means that it cannot run scripts or escape the sandbox. 
    Most likely you will have to enable one of more of these in order to make your content work properly. 
    This reduces security, so only do it for sources you trust.
</p>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows to run scripts</span>
    <Toggle name="allowScripts" bind:on={allowScripts} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows form submission</span>
    <Toggle name="allowForms" bind:on={allowForms} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows to open modal windows</span>
    <Toggle name="allowModals" bind:on={allowModals} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows to lock the screen orientation</span>
    <Toggle name="allowOrientationLock" bind:on={allowOrientationLock} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows to use the Pointer Lock API</span>
    <Toggle name="allowPointerLock" bind:on={allowPointerLock} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows popups</span>
    <Toggle name="allowPopups" bind:on={allowPopups} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows popups to open new windows without inheriting the sandboxing</span>
    <Toggle name="allowPopupsToEscapeSandbox" bind:on={allowPopupsToEscapeSandbox} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows to start a presentation session</span>
    <Toggle name="allowPresentation" bind:on={allowPresentation} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows the iframe content to be treated as being from the same origin</span>
    <Toggle name="allowSameOrigin" bind:on={allowSameOrigin} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows the iframe content to navigate its top-level browsing context</span>
    <Toggle name="allowTopNavigation" bind:on={allowTopNavigation} />
</div>

<div class="w-full flex flex-row justify-between items-center mt-2">
    <span>Allows the iframe content to navigate its top-level browsing context, but only if initiated by user</span>
    <Toggle name="allowTopLevelNavigationByUserActivation" bind:on={allowTopLevelNavigationByUserActivation} />
</div>