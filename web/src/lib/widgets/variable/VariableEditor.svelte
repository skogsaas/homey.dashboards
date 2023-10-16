<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    // UI elements
    import DevicePicker from '$lib/components/DevicePicker.svelte';

    // Tailwind
    import Input from "stwui/input";

    import { devices, variables } from '$lib/stores/homey';

    import type { CapabilityObj, DeviceObj, Variable } from '$lib/types/Homey';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import type { VariableSettings_v1 } from './VariableSettings';
    import IconPicker from '$lib/components/IconPicker.svelte';
    import VariablePicker from '$lib/components/VariablePicker.svelte';

    const dispatch = createEventDispatcher();
    
    export let settings: VariableSettings_v1;

    let variableId: string | undefined;
    let title: string | undefined;
    let iconId: string | undefined;

    let variable: Variable | undefined;

    $: onSettings(settings);

    $: onCapability(variableId);
    $: onTitle(title);
    $: onIcon(iconId);

    function onSettings(s: VariableSettings_v1) {
        variableId = s?.variableId;
        title = s?.title;
        iconId = s?.iconId;
    }

    function onCapability(id: string | undefined) {
        if(id !== settings.variableId) {
            dispatch('settings', { ...settings, variableId: id });
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

<div class="mt-2">
    <VariablePicker bind:variableId={variableId} on:variable={(v) => (variable = v.detail)} />
</div>

{#if variable}
    <Input name="title" bind:value={title} placeholder={variable.name} class="mt-2" />
{/if}

<div class="mt-2">
    <IconPicker bind:iconId={iconId} />
</div>