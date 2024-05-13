<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { v4 as uuid } from 'uuid';

    import Toggle from 'stwui/toggle';

    import { colors } from './colors';
    
    import type { Series_v5 } from './InsightSettings';
    import ThresholdEditor from '$lib/components/thresholds/ThresholdEditor.svelte';
    import type { Threshold } from '$lib/types/Widgets';
    
    export let series: Series_v5;
    export let index: number;

    const dispatch = createEventDispatcher();

    interface Option {
        value: any;
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
        {value: 10, label: '10 seconds'},
        {value: 20, label: '20 seconds'},
        {value: 30, label: '30 seconds'},
        {value: 60, label: '1 min'},
        {value: 300, label: '5 min'},
        {value: 600, label: '10 min'},
        {value: 900, label: '15 min'},
        {value: 1200, label: '20 min'},
        {value: 1800, label: '30 min'},
        {value: 3600, label: '1 hour'},
        {value: 7200, label: '2 hours'},
        {value: 10800, label: '3 hours'},
        {value: 21600, label: '6 hours'},
        {value: 43200, label: '12 hours'},
        {value: 86400, label: '24 hours'}
    ];

    const types: Option[] = [
        {value:'line', label: 'Line'},
        {value:'bar', label: 'Bar'},
    ];

    let insightId: string | undefined;
    let title: string | undefined;
    let type: Option;
    let border: Threshold[];
    let background: Threshold[];
    let fill: boolean;
    let aggregation: Option;
    let sampleRate: Option;

    $: onSeries(series);
    $: onChange(insightId, title, type?.value ?? 'line', border, background, fill, aggregation?.value ?? 'none', sampleRate?.value ?? 60);
    
    function onSeries(s: Series_v5) {
        insightId = series.insightId;
        title = series.title;
        type = types.find(t => t.value === (series.type ?? 'line'))!;
        fill = series.fill ?? false;
        aggregation = aggregations.find(a => a.value === (series?.aggregation ?? 'none'))!;
        sampleRate = sampleRates.find(r => r.value === (series?.sampleRate ?? 60))!;
        border = s.border ?? [{ id: uuid(), color: colors[index % colors.length], value: Number.MIN_SAFE_INTEGER }];
        background = s.background ?? [{ id: uuid(), color: colors[index % colors.length], value: Number.MIN_SAFE_INTEGER }];
    };

    function onChange(
        _insightId: string | undefined,
        _title: string | undefined,
        _type: string,
        _border: Threshold[],
        _background: Threshold[],
        _fill: boolean,
        _aggregation: string,
        _sampleRate: number
    ) {
        if(
            _insightId !== series.insightId ||
            _title !== series.title ||
            _type !== series.type ||
            _border !== series.border ||
            _background !== series.background ||
            _fill !== series.fill || 
            _aggregation !== series.aggregation ||
            _sampleRate !== series.sampleRate
        ) {
            dispatch('series', 
            { 
                ...series, 
                insightId: _insightId,
                title: _title,
                type: _type,
                border: _border,
                background: _background,
                fill: _fill,
                aggregation: _aggregation,
                sampleRate: _sampleRate
            });
        }
    }

</script>

<div class="m-2">
    <input class="input w-full" bind:value={title} placeholder="Title" />

    <select class="select w-full mt-4" bind:value={type} placeholder="Type">
        {#each types as option}
            <option value={option}>{option.label}</option>
        {/each}
    </select>

    <div class="divider">Aggregation</div>
    <select class="select w-full" bind:value={aggregation} placeholder="Aggregation">
        {#each aggregations as option}
            <option value={option}>{option.label}</option>
        {/each}
    </select>

    {#if aggregation !== undefined && aggregation.value !== 'none'}
        <select class="select w-full mt-4" bind:value={sampleRate} placeholder="Sample rate">
            {#each sampleRates as option}
                <option value={option}>{option.label}</option>
            {/each}
        </select>
    {/if}

    <div class="divider">{type.label + ' color'}</div>
    <ThresholdEditor bind:thresholds={border} colorMode="rgba" />
    
    <div class="divider">Background color</div>
    <ThresholdEditor bind:thresholds={background} colorMode="rgba" />

    <div class="form-control mt-4">
        <label class="label cursor-pointer">
            <span class="label-text">Fill background</span> 
            <input type="checkbox" class="toggle" bind:checked={fill} />
        </label>
    </div>
</div>