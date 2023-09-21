<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Select from 'stwui/select';
    import Input from 'stwui/input';
    import Divider from 'stwui/divider';
    import Toggle from 'stwui/toggle';

    import { colors } from './colors';
    import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
    
    import type { Series_v4 } from './InsightSettings';
    
    export let series: Series_v4;
    export let index: number;

    const dispatch = createEventDispatcher();

    interface Option {
        value: string;
        label: string;
    }

    const aggregations: Option[] = [
        {value: 'none', label: 'No aggregation'},
        {value: 'min', label: 'Min'},
        {value: 'max', label: 'Max'},
        {value: 'sum', label: 'Sum'},
        {value: 'avg', label: 'Avg'},
        {value: 'first', label: 'First'},
        {value: 'last', label: 'Last'}
    ];

    const sampleRates: Option[] = [
        {value:'10', label: '10 seconds'},
        {value:'20', label: '20 seconds'},
        {value:'30', label: '30 seconds'},
        {value:'60', label: '1 min'},
        {value:'300', label: '5 min'},
        {value:'600', label: '10 min'},
        {value:'900', label: '15 min'},
        {value:'1200', label: '20 min'},
        {value:'1800', label: '30 min'},
        {value:'3600', label: '1 hour'},
        {value:'7200', label: '2 hours'},
        {value:'10800', label: '3 hours'},
        {value:'21600', label: '6 hours'},
        {value:'43200', label: '12 hours'},
        {value:'86400', label: '24 hours'}
    ];

    const types: Option[] = [
        {value:'line', label: 'Line'},
        {value:'bar', label: 'Bar'},
    ];

    let insightId: string | undefined;
    let title: string | undefined;
    let type: Option;
    let borderColor: RgbaColor;
    let backgroundColor: RgbaColor;
    let fill: boolean;
    let aggregation: Option;
    let sampleRate: Option;

    $: onSeries(series);

    $: onInsight(insightId);
    $: onTitle(title);
    $: onType(type);
    $: onBorderColor(borderColor);
    $: onBackgroundColor(backgroundColor);
    $: onFill(fill);
    $: onAggregation(aggregation);
    $: onSampleRate(sampleRate);
    
    function onSeries(s: Series_v4) {
        insightId = series.insightId;
        title = series.title;
        type = types.find(t => t.value === (series.type ?? 'line'))!;
        borderColor = stringToRgba(series.borderColor ?? colors[index]);
        backgroundColor = stringToRgba(series.backgroundColor ?? colors[index]);
        fill = series.fill ?? false;
        aggregation = aggregations.find(a => a.value === (series?.aggregation ?? 'none'))!;
        sampleRate = sampleRates.find(r => r.value === ('' + (series?.sampleRate ?? 60)))!;
    };

    function onInsight(value: string | undefined) {
        if(value == undefined || value === series.insightId) {
            return;
        }

        dispatch('series', { ...series, insightId });
    }

    function onTitle(value: string | undefined) {
        if(value === series.title) {
            return;
        }

        dispatch('series', { ...series, title: value });
    }

    function onType(option: Option | undefined) {
        if(option == undefined || option.value === series.type) {
            return;
        }

        dispatch('series', { ...series, type: option.value });
    }

    function onBorderColor(value: RgbaColor) {
        const stringValue = `rgba(${value.r},${value.g},${value.b},${value.a})`
        
        if(stringValue === series.borderColor) {
            return;
        }

        dispatch('series', { ...series, borderColor: stringValue });
    }

    function onBackgroundColor(value: RgbaColor) {
        const stringValue = `rgba(${value.r},${value.g},${value.b},${value.a})`
        
        if(stringValue === series.backgroundColor) {
            return;
        }

        dispatch('series', { ...series, backgroundColor: stringValue });
    }

    function onFill(value: boolean) {
        if(value === series.fill) {
            return;
        }

        dispatch('series', { ...series, fill: value });
    }

    function onAggregation(option: Option | undefined) {
        if(option == undefined || option.value === series.aggregation) {
            return;
        }

        dispatch('series', { ...series, aggregation: option.value });
    }

    function onSampleRate(option: Option | undefined) {
        if(option == undefined || Number(option.value) === series.sampleRate) {
            return;
        }

        dispatch('series', { ...series, sampleRate: Number(option.value) });
    }

    function stringToRgba(value: string) : RgbaColor {
        console.log(value);

        var result = /^rgba\((.+),(.+),(.+),(.+)\)$/i.exec(value);
        return {
            r: parseInt(result![1]),
            g: parseInt(result![2]),
            b: parseInt(result![3]),
            a: parseFloat(result![4])
        }
    }
</script>

<div>
    <Input name="title" bind:value={title} placeholder="Override title" />

    <Select bind:value={type} placeholder="Type" name="type">
        <Select.Options slot="options" class="max-h-96 overflow-auto">
            {#each types as option}
                <Select.Options.Option {option} />
            {/each}
        </Select.Options>
    </Select>

    <Divider>
        <Divider.Label slot="label">Aggregation</Divider.Label>
    </Divider>

    <Select bind:value={aggregation} placeholder="Aggregation" name="aggregation">
        <Select.Options slot="options" class="max-h-96 overflow-auto">
            {#each aggregations as option}
                <Select.Options.Option {option} />
            {/each}
        </Select.Options>
    </Select>

    {#if series.aggregation !== undefined && series.aggregation !== 'none'}
        <Select bind:value={sampleRate} placeholder="Sample rate" name="sampleRate">
            <Select.Options slot="options" class="max-h-96 overflow-auto">
                {#each sampleRates as option}
                    <Select.Options.Option {option} />
                {/each}
            </Select.Options>
        </Select>
    {/if}

    <Divider>
        <Divider.Label slot="label">Colors</Divider.Label>
    </Divider>

    <h3 class="mb-4">{type.label + ' color'}</h3>
    <ColorPicker bind:rgb={borderColor} isOpen isPopup={false} isInput={false} />
    
    <h3 class="mb-4 mt-4">Background color</h3>
    
    <div class="mb-4">
        <Toggle
            name="fill"
            bind:on={fill}
        >
            <Toggle.ContentLeft slot="content-left">
                <Toggle.ContentLeft.Label slot="label">Fill</Toggle.ContentLeft.Label>
            </Toggle.ContentLeft>
        </Toggle>
    </div>

    <ColorPicker bind:rgb={backgroundColor} label="Background color" isOpen isPopup={false} isInput={false} />
</div>