<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { CapabilityObj } from '$lib/types/Homey';
    import type { CapabilitySettings_v5 } from './CapabilitySettings';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import IconPicker from '$lib/components/IconPicker.svelte';
    import TextPicker from '$lib/components/TextPicker.svelte';

    const dispatch = createEventDispatcher();
    
    export let settings: CapabilitySettings_v5;

    let capabilityUri: string | undefined;
    let title: string | undefined;
    let iconId: string | undefined;

    let capability: CapabilityObj | undefined;

    $: onSettings(settings);

    $: onCapability(capabilityUri);
    $: onTitle(title);
    $: onIcon(iconId);

    function onSettings(s: CapabilitySettings_v5) {
        capabilityUri = s?.capabilityUri;
        title = s?.title;
        iconId = s?.iconId;
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

    function onIcon(id: string | undefined) {
        if(id !== settings.iconId) {
            dispatch('settings', { ...settings, iconId: id });
        }
    }
</script>

<CapabilityPicker bind:capabilityUri={capabilityUri} on:capability={(c) => (capability = c.detail)} />

{#if capability}
    <TextPicker bind:value={title} placeholder={capability.title} label="Title" />
{/if}

<IconPicker bind:iconId={iconId} />