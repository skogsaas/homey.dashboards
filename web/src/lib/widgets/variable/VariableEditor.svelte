<script lang="ts">
    // Svelte
    import { createEventDispatcher } from 'svelte';

    // UI elements
    import IconPicker from '$lib/components/IconPicker.svelte';
    import VariablePicker from '$lib/components/VariablePicker.svelte';
    import ColorPicker from '$lib/components/ColorPicker.svelte';

    // Stores
    import { variables } from '$lib/stores/homey';

    // Types
    import type { Variable } from '$lib/types/Homey';
    import type { VariableSettings_v3 } from './VariableSettings';
    import type { Threshold } from '$lib/types/Widgets';
    
    interface Option {
        value: string;
        label: string;
    }

    const booleanVariants: Option[] = [
        {value: 'toggle', label: 'Toggle'},
        {value: 'icon-button', label: 'Icon button'},
        {value: 'icon-group-horizontal', label: 'Icon group horizontal'},
        {value: 'icon-group-vertical', label: 'Icon group vertical'}
    ];

    const numberVariants: Option[] = [
        {value: 'slider', label: 'Slider'},
        {value: 'input', label: 'Input'}
    ];

    const dispatch = createEventDispatcher();
    
    export let settings: VariableSettings_v3;

    let variableId: string | undefined;
    let title: string | undefined;
    let iconId: string | undefined;

    // Boolean settings
    let booleanVariant: Option;
    let booleanIconId: string | undefined;
    let booleanIconTrueId: string | undefined;
    let booleanIconFalseId: string | undefined;
    let booleanColor: string | undefined;
    let booleanColorTrue: string | undefined;
    let booleanColorFalse: string | undefined;

    // Number settings
    let numberVariant: Option;
    let numberMin: number | undefined;
    let numberMax: number | undefined;
    let numberStep: number | undefined;
    let numberUnit: string | undefined;
    let numberThresholds: Threshold[] | undefined;

    let variable: Variable | undefined;

    $: onSettings(settings);

    $: onVariableId(variableId);
    $: onTitle(title);
    $: onIconId(iconId);
    $: onBoolean(booleanVariant, booleanIconId, booleanIconTrueId, booleanIconFalseId, booleanColor, booleanColorTrue, booleanColorFalse);
    $: onNumber(numberVariant, numberMin, numberMax, numberStep, numberUnit, numberThresholds);

    function onSettings(s: VariableSettings_v3) {
        variableId = s?.variableId;
        title = s?.title;
        iconId = s?.iconId;

        booleanVariant = booleanVariants.find(v => v.value === (s.boolean?.variant ?? 'toggle'))!;
        booleanIconId = s.boolean?.iconId;
        booleanIconTrueId = s.boolean?.iconTrueId;
        booleanIconFalseId = s.boolean?.iconFalseId;
        booleanColor = s.boolean?.color;
        booleanColorTrue = s.boolean?.colorTrue;
        booleanColorFalse = s.boolean?.colorFalse;

        numberVariant = numberVariants.find(v => v.value === (s.number?.variant ?? 'slider'))!;
        numberMin = s.number?.min;
        numberMax = s.number?.max;
        numberStep = s.number?.step;
        numberUnit = s.number?.unit;
        numberThresholds = s.number?.thresholds;

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

    function onIconId(id: string | undefined) {
        if(id !== settings.iconId) {
            dispatch('settings', { ...settings, iconId: id });
        }
    }

    function onBoolean(
        variant: Option,
        iconId: string | undefined,
        iconTrueId: string | undefined,
        iconFalseId: string | undefined,
        color: string | undefined,
        colorTrue: string | undefined,
        colorFalse: string | undefined
    ) {
        const boolean = { variant: variant.value, iconId, iconTrueId, iconFalseId, color, colorTrue, colorFalse };

        if(JSON.stringify(boolean) !== JSON.stringify(settings.boolean)){
            dispatch('settings', { ...settings, boolean });
        }
    }

    function onNumber(
        variant: Option,
        min: number | undefined, 
        max: number | undefined, 
        step: number | undefined, 
        unit: string | undefined,
        thresholds: Threshold[] | undefined
    ) {
        const number = { variant: variant.value, min, max, step, unit, thresholds };

        if(JSON.stringify(number) !== JSON.stringify(settings.number)){
            dispatch('settings', { ...settings, number });
        }
    }
</script>

<div class="mt-2">
    <VariablePicker bind:variableId={variableId} on:variable={(e) => (variable = e.detail)} />
</div>

{#if variable}
    <Input name="title" bind:value={title} placeholder={variable.name} class="mt-2" />

    <div class="mt-1">
        <IconPicker bind:iconId={iconId} placeholder="Leading icon" />
    </div>

    {#if variable.type === 'boolean'}

        <div class="mt-1">
            <Select bind:value={booleanVariant} placeholder="Variant" name="variant">
                <Select.Options slot="options" class="max-h-96 overflow-auto">
                    {#each booleanVariants as option}
                        <Select.Options.Option {option} />
                    {/each}
                </Select.Options>
            </Select>
        </div>

        <div class="mt-1">
            <IconPicker bind:iconId={booleanIconId} placeholder="Default icon" />
        </div>
            
        <div class="mt-1">
            <IconPicker bind:iconId={booleanIconTrueId} placeholder="True icon" />
        </div>

        <div class="mt-1">
            <IconPicker bind:iconId={booleanIconFalseId} placeholder="False icon" />
        </div>
        
        <div class="mt-1">
            <ColorPicker bind:value={booleanColor} mode="rgba" />
            <span>Default color</span>
        </div>
        
        <div class="mt-1">
            <ColorPicker bind:value={booleanColorTrue} mode="rgba" />
            <span>True color</span>
        </div>

        <div class="mt-1">
            <ColorPicker bind:value={booleanColorFalse} mode="rgba" />
            <span>False color</span>
        </div>

    {:else if variable.type === 'number'}

        <div class="mt-1">
            <Select bind:value={numberVariant} placeholder="Variant" name="variant">
                <Select.Options slot="options" class="max-h-96 overflow-auto">
                    {#each numberVariants as option}
                        <Select.Options.Option {option} />
                    {/each}
                </Select.Options>
            </Select>
        </div>

        <div class="mt-1">
            <InputNumber name="min" placeholder="Min" bind:value={numberMin} />
        </div>

        <div class="mt-1">
            <InputNumber name="max" placeholder="Max" bind:value={numberMax} />
        </div>

        <div class="mt-1">
            <InputNumber name="step" placeholder="Step" bind:value={numberStep} />
        </div>

        <div class="mt-1">
            <Input name="unit" placeholder="Unit" bind:value={numberUnit} />
        </div>

        <!--
        <ThresholdEditor bind:thresholds={numberThresholds} colorMode="rgba" />
        -->

    {/if}
{/if}