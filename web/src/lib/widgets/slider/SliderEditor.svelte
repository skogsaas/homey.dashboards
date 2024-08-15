<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { SliderSettings_v3 } from "./SliderSettings";
    import HomeyPicker from '$lib/components/HomeyPicker/HomeyPicker.svelte';
    import BooleanPicker from '$lib/components/BooleanPicker.svelte';
    import TextPicker from '$lib/components/TextPicker.svelte';
    import NumberPicker from '$lib/components/NumberPicker.svelte';
    import type { CapabilityObj, DeviceObj, Variable } from '$lib/types/Homey';

    const dispatch = createEventDispatcher();
    
    export let settings: SliderSettings_v3;

    let uri: string | undefined;
    let label: string | undefined;

    let min: number | undefined;
    let max: number | undefined;
    let step: number | undefined;
    let decimals: number | undefined;

    let unit: string | undefined;

    let labelPosition: 'left'|'right'|'top'|'bottom'|'hidden' = 'left';
    let labelSize: string | undefined;
    let valuePosition: 'left'|'right'|'top'|'bottom'|'hidden' = 'right';
    let valueSize: string | undefined;

    let hideMinMax: boolean = false;

    let item: any | undefined;

    $: onSettings(settings);
    $: onChange(uri, label, min, max, step, decimals, unit, labelPosition, labelSize, valuePosition, valueSize, hideMinMax);

    function onSettings(s: SliderSettings_v3) {
        uri = s.uri;
        label = s.label;
        
        min = s.min;
        max = s.max;
        step = s.step;
        decimals = s.decimals;

        unit = s.unit;

        labelPosition = s.labelPosition ?? 'left';
        labelSize = s.labelSize;
        valuePosition = s.valuePosition ?? 'right'
        valueSize = s.valueSize;

        hideMinMax = s.hideMinMax ?? false;
    }

    function onChange(
        _uri: string | undefined, 
        _label: string | undefined,
        _min: number | undefined,
        _max: number | undefined,
        _step: number | undefined,
        _decimals: number | undefined,
        _unit: string | undefined,
        _labelPosition: any,
        _labelSize: any, 
        _valuePosition: any,
        _valueSize: any,
        _hideMinMax: boolean
    ) {
        if(_uri !== settings.uri || 
            _label !== settings.label ||
            _min !== settings.min ||
            _max !== settings.max ||
            _step !== settings.step ||
            _decimals !== settings.decimals ||
            _unit !== settings.unit ||
            _labelPosition !== settings.labelPosition ||
            _labelSize !== settings.labelSize ||
            _valuePosition !== settings.valuePosition ||
            _valueSize !== settings.valueSize ||
            _hideMinMax !== settings.hideMinMax
        ) {
            settings = { 
                ...settings, 
                uri: _uri,
                label: _label,
                min: _min,
                max: _max,
                step: _step,
                decimals: _decimals,
                unit: _unit,
                labelPosition: _labelPosition,
                labelSize: _labelSize,
                valuePosition: _valuePosition,
                valueSize: _valueSize,
                hideMinMax: _hideMinMax
            };

            dispatch('settings', settings);
        }
    }

    function variableFilter(variable: Variable) : boolean {
        return variable.type === 'number';
    }

    function capabilityFilter(device: DeviceObj, capability: CapabilityObj) : boolean {
        return capability.type === 'number';
    }
</script>

<HomeyPicker bind:uri={uri} on:item={(e) => (item = e.detail)} {variableFilter} {capabilityFilter} label="Item" />
<TextPicker bind:value={label} placeholder={item?.title ?? 'Label'} label="Label" />

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Label position</span>
    </div>
    <select class="select" bind:value={labelPosition}>
        <option value="left">left</option>
        <option value="right">right</option>
        <option value="top">top</option>
        <option value="bottom">bottom</option>
        <option value="hidden">hidden</option>
    </select>
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Label size</span>
    </div>
    <select class="select" bind:value={labelSize}>
        <option value="text-xs">x-small</option>
        <option value="text-sm">small</option>
        <option value={undefined}>normal</option>
        <option value="text-lg">large</option>
        <option value="text-xl">x-large</option>
        <option value="text-2xl">2xl</option>
        <option value="text-3xl">3xl</option>
        <option value="text-4xl">4xl</option>
        <option value="text-5xl">5xl</option>
        <option value="text-6xl">6xl</option>
        <option value="text-7xl">7xl</option>
        <option value="text-8xl">8xl</option>
        <option value="text-9xl">9xl</option>
    </select>
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Value position</span>
    </div>
    <select class="select" bind:value={valuePosition}>
        <option value="left">left</option>
        <option value="right">right</option>
        <option value="top">top</option>
        <option value="bottom">bottom</option>
        <option value="hidden">hidden</option>
    </select>
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Value size</span>
    </div>
    <select class="select" bind:value={valueSize}>
        <option value="text-xs">x-small</option>
        <option value="text-sm">small</option>
        <option value={undefined}>normal</option>
        <option value="text-lg">large</option>
        <option value="text-xl">x-large</option>
        <option value="text-2xl">2xl</option>
        <option value="text-3xl">3xl</option>
        <option value="text-4xl">4xl</option>
        <option value="text-5xl">5xl</option>
        <option value="text-6xl">6xl</option>
        <option value="text-7xl">7xl</option>
        <option value="text-8xl">8xl</option>
        <option value="text-9xl">9xl</option>
    </select>
</label>

<NumberPicker bind:value={min} placeholder={item?.capability?.min ?? "Min"} label="Min" />
<NumberPicker bind:value={max} placeholder={item?.capability?.max ?? "Max"} label="Max" />
<NumberPicker bind:value={step} placeholder={item?.capability?.step ?? "Step"} label="Step" />
<NumberPicker bind:value={decimals} placeholder={item?.capability?.decimals ?? "Decimals"} label="Decimals" />
<TextPicker bind:value={unit} placeholder="Unit" label="Unit" />
<BooleanPicker bind:checked={hideMinMax} label="Hide min/max" />