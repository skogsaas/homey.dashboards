<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { v4 as uuid } from 'uuid';

    import { colors } from './colors';
    
    import type { Series_v5 } from './InsightSettings';
    import ThresholdEditor from '$lib/components/thresholds/ThresholdEditor.svelte';
    import type { Threshold } from '$lib/types/Widgets';
    import TextPicker from '$lib/components/TextPicker.svelte';
    
    export let series: Series_v5;
    export let index: number;

    const dispatch = createEventDispatcher();

    let insightId: string | undefined;
    let title: string | undefined;
    let type: string;
    let border: Threshold[];
    let background: Threshold[];
    let fill: boolean;
    let aggregation: string;
    let sampleRate: number;

    $: onSeries(series);
    $: onChange(insightId, title, type ?? 'line', border, background, fill, aggregation ?? 'none', sampleRate ?? 60);
    
    function onSeries(s: Series_v5) {
        insightId = series.insightId;
        title = series.title;
        type = series.type ?? 'line';
        fill = series.fill ?? false;
        aggregation = series?.aggregation ?? 'none';
        sampleRate = series?.sampleRate ?? 60;
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

<TextPicker label="Title" placeholder="Title" bind:value={title} />

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Series type</span>
    </div>
    <select class="select" bind:value={type}>
        <option value="line">Line</option>
        <option value="bar">Bar</option>
    </select>
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Aggregation</span>
    </div>
    <select class="select w-full" bind:value={aggregation} placeholder="Aggregation">
        <option value="none">No aggregation</option>
        <option value="min">Min</option>
        <option value="max">Max</option>
        <option value="sum">Sum</option>
        <option value="avg">Avg</option>
        <option value="first">First</option>
        <option value="last">Las</option>
    </select>
</label>

{#if aggregation !== 'none'}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Aggregation</span>
        </div>
        <select class="select w-full mt-4" bind:value={sampleRate} placeholder="Sample rate">
            <option value=10>10 seconds</option>
            <option value=20>20 seconds</option>
            <option value=30>30 seconds</option>
            <option value=60>1 min</option>
            <option value=300>5 min</option>
            <option value=600>10 min</option>
            <option value=900>15 min</option>
            <option value=1200>20 min</option>
            <option value=1800>30 min</option>
            <option value=3600>1 hour</option>
            <option value=7200>2 hours</option>
            <option value=10800>3 hours</option>
            <option value=21600>6 hours</option>
            <option value=43200>12 hours</option>
            <option value=86400>24 hours</option>
        </select>
    </label>
{/if}

<div class="divider">{type + ' color'}</div>
<ThresholdEditor bind:thresholds={border} colorMode="rgba" />

<div class="divider">Background color</div>
<ThresholdEditor bind:thresholds={background} colorMode="rgba" />

<div class="form-control mt-4">
    <label class="label cursor-pointer">
        <span class="label-text">Fill background</span> 
        <input type="checkbox" class="toggle" bind:checked={fill} />
    </label>
</div>