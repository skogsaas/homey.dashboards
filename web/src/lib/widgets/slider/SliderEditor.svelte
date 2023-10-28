<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { devices, homey } from '$lib/stores/homey';

    // UI elements
    import DevicePicker from '$lib/components/DevicePicker.svelte';

    // Tailwind
    import Input from 'stwui/input';
    import Toggle from 'stwui/toggle';

    import type { SliderSettings_v2 } from "./SliderSettings";
    import type { CapabilityObj } from '$lib/types/Homey';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';

    const dispatch = createEventDispatcher();
    
    export let settings: SliderSettings_v2;

    let hideMinMax: boolean = false;

    let capabilityUri: string | undefined;
    let title: string | undefined;
    let iconId: string | undefined;

    let capability: CapabilityObj | undefined;

    $: onSettings(settings);

    $: onCapability(capabilityUri);
    $: onTitle(title);
    $: onHideMinMax(hideMinMax);

    function onSettings(s: SliderSettings_v2) {
        capabilityUri = s?.capabilityUri;
        title = s?.title;
        hideMinMax = s?.hideMinMax ?? false;
    }

    function onCapability(id: string | undefined) {
        if(id !== settings.capabilityUri) {
            dispatch('settings', { ...settings, capabilityUri: id });
        }
    }

    function onTitle(t: string | undefined) {
        const value = t !== undefined && t.length > 0 ? t : undefined;

        if(value !== settings.title) {
            dispatch('settings', { ...settings, title: value });
        }
    }

    function onHideMinMax(hide: boolean) {
        if(hide !== settings.hideMinMax) {
            dispatch('settings', { ...settings, hideMinMax: hide });
        }
    }

    function capabilityFilter(capability: CapabilityObj) : boolean {
        return capability.setable &&
            capability.type === 'number' && 
            capability.min !== undefined && 
            capability.max !== undefined;
    }
</script>

<div class="mt-2">
    <CapabilityPicker bind:capabilityUri={capabilityUri} on:capability={(c) => (capability = c.detail)} {capabilityFilter} />
</div>

{#if capability}
    <Input name="title" bind:value={title} placeholder={capability.title} class="mt-2" />

    <div class="pt-4">
        <Toggle
            name="hideMinMax"
            bind:on={hideMinMax}
        >
            <Toggle.ContentRight slot="content-right">
                <Toggle.ContentRight.Label slot="label">Hide min max</Toggle.ContentRight.Label>
            </Toggle.ContentRight>
        </Toggle>
    </div>
{/if}