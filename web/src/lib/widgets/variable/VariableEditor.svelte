<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    // UI elements
    import DevicePicker from '$lib/components/DevicePicker.svelte';

    // Tailwind
    import { Input, InputNumber } from "stwui";

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
    let min: number | undefined;
    let max: number | undefined;
    let step: number | undefined;
    let unit: string | undefined;

    let variable: Variable | undefined;

    $: onSettings(settings);

    $: onVariableId(variableId);
    $: onTitle(title);
    $: onIcon(iconId);
    $: onNumber(min, max, step, unit);

    function onSettings(s: VariableSettings_v1) {
        variableId = s?.variableId;
        title = s?.title;
        iconId = s?.iconId;

        min = s.number?.min;
        max = s.number?.max;

        variable = $variables[variableId ?? ''];
    }

    function onVariableId(id: string | undefined) {
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

    function onNumber(min: number | undefined, max: number | undefined, step: number | undefined, unit: string | undefined) {
        if(min !== settings.number?.min || 
            max !== settings.number?.max || 
            step !== settings.number?.step ||
            unit !== settings.number?.unit
        ) {
            const number = settings.number ?? {};

            dispatch('settings', { ...settings, number: { ...number, min, max, step, unit } });
        }
    }
</script>

<div class="mt-2">
    <VariablePicker bind:variableId={variableId} on:variable={(e) => (variable = e.detail)} />
</div>

{#if variable}
    <Input name="title" bind:value={title} placeholder={variable.name} class="mt-2" />

    {#if variable.type === 'number'} 
        <InputNumber name="min" placeholder="Min" bind:value={min} />
        <InputNumber name="max" placeholder="Max" bind:value={max} />
        <InputNumber name="step" placeholder="Step" bind:value={step} />
        <Input name="unit" placeholder="Unit" bind:value={unit} />
    {/if}
{/if}

<div class="mt-2">
    <IconPicker bind:iconId={iconId} />
</div>