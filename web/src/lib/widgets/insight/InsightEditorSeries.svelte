<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { insights } from '$lib/stores/homey';

    import type { Log } from '$lib/types/Homey';
    import Select from 'stwui/select';
    
    import type { Series_v3 } from './InsightSettings';
    
    export let series: Series_v3;

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

    let insightId: string | undefined;
    let aggregation: Option;
    let sampleRate: Option;

    $: onSeries(series);

    $: onInsight(insightId);
    $: onAggregation(aggregation);
    $: onSampleRate(sampleRate);

    function onSeries(s: Series_v3) {
        insightId = series?.insightId;
        aggregation = aggregations.find(a => a.value === (series?.aggregation ?? 'none'))!;
        sampleRate = sampleRates.find(s => s.value === ('' + (series?.sampleRate ?? 60)))!;
    };

    function onInsight(value: string | undefined) {
        if(value == undefined || value === series.insightId) {
            return;
        }

        dispatch('series', { ...series, insightId });
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
</script>

<div>
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
</div>