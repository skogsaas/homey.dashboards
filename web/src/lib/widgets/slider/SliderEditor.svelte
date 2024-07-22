<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { SliderSettings_v2 } from "./SliderSettings";
    import type { CapabilityObj } from '$lib/types/Homey';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import TextPicker from '$lib/components/TextPicker.svelte';

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

<CapabilityPicker bind:capabilityUri={capabilityUri} on:capability={(c) => (capability = c.detail)} {capabilityFilter} />

{#if capability}
    <TextPicker label="Title" placeholder={capability.title} bind:value={title} />

    <div class="form-control w-full">
        <label class="label cursor-pointer">
            <span class="label-text">Hide min/max</span> 
            <input type="checkbox" class="toggle" bind:checked={hideMinMax} />
        </label>
    </div>
{/if}