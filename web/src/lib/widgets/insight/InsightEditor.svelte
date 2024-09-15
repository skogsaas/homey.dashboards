<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { devices, insights } from '$lib/stores/homey';

    import type { InsightSettings_v5 } from "./InsightSettings";
    import type { Series_v5 } from './InsightSettings';

    import InsightPicker from '$lib/components/InsightPicker.svelte';
    import InsightEditorSeries from './InsightEditorSeries.svelte';
    import { mdiDelete } from '$lib/components/icons';
    import Icon from '$lib/components/Icon.svelte'
    
    const dispatch = createEventDispatcher();

    export let settings: InsightSettings_v5;

    let openInsightId: string | undefined;
    let height: number;
    let resolution: string;
    let series: Series_v5[] = [];

    let selectedLogId: string | undefined;

    $: onSettings(settings);
    $: onChanges(series, resolution, height)

    function onSettings(_settings: InsightSettings_v5) {
        resolution = _settings.resolution ?? 'today';
        series = [..._settings?.series ?? []];
        height = settings.height ?? 200;
    };

    function onChanges(_series: Series_v5[], _resolution: string, _height: number) {
        if(_series !== settings.series || 
            _resolution !== settings.resolution ||
            _height !== settings.height) {
            
            settings = {
                ...settings,
                series: _series,
                resolution: _resolution,
                height: _height
            }

            dispatch('settings', settings);
        }
    }

    function onLog(logId: string) {
        series = [...series, { insightId: logId }];

        selectedLogId = undefined;
    }

    function onSeries(index: number, s: Series_v5) {
        const updatedSeries = [...series];
        updatedSeries[index] = { ...s };

        series = updatedSeries;
    }

    function getLogName(logId: string | undefined) {
        if(logId !== undefined) {
            const log = $insights[logId];

            return getOwnerName(log.ownerUri) + ' - ' + log.title;
        }
        
        return 'Unknown';
    }

    function getOwnerName(uri: string) {
        if(uri.startsWith('homey:device:')) {
            const prefix = 'homey:device:';
            const id = uri.slice(prefix.length);

            return $devices[id]?.name ?? uri;
        } else if(uri.startsWith('homey:manager:apps')) {
            return 'Homey Apps';
        } else if(uri.startsWith('homey:manager:system')) {
            return 'Homey System';
        } else if(uri.startsWith('homey:manager:weather')) {
            return 'Homey Weather';
        } else if(uri.startsWith('homey:manager:logic')) {
            return 'Homey Logic';
        } else {
            return uri;
        }
    }

    function removeInsight(index: number) {
        series = [...series.filter((s, i) => i !== index)];
    }
</script>

<InsightPicker bind:logId={selectedLogId} on:logId={(e) => onLog(e.detail)} logs={Object.values($insights)} />

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Timespan</span>
    </div>
    <select class="select" bind:value={resolution}>
        <option value="lastHour">Last hour</option>
        <option value="last6Hours">Last 6 hours</option>
        <option value="last24Hours">Last 24 hours</option>
        <option value="last7Days">Last 7 days</option>
        <option value="last14Days">Last 14 days</option>
        <option value="last31Days">Last 31 days</option>
        <option value="today">Today</option>
        <option value="thisWeek">This week</option>
        <option value="thisMonth">This month</option>
        <option value="thisYear">This year</option>
        <option value="yesterday">Yesterday</option>
        <option value="lastWeek">Last week</option>
        <option value="lastMonth">Last month</option>
        <option value="lastYear">Last year</option>
        <option value="last2Years">Last 2 years</option>
    </select>
</label>

<div class="flex flex-col w-full h-full px-1">
    <span class="w-full text-center">{height} px</span>

    <div class="flex flex-row mt-2 gap-1">
        <span class="whitespace-nowrap">0 px</span>
        <div class="h-full flex-grow">
            <input
                type="range"
                class="range"
                bind:value={height}
                min={0} 
                max={1000} 
                step={1}
            />
        </div>
        <span class="whitespace-nowrap">1000 px</span>
    </div>
</div>

<div class="mt-4">
    {#each series as s, i}
        <div class="collapse bg-base-200">
            <input type="radio" name="insights" checked={openInsightId === s.insightId} /> 
            <div class="collapse-title text-lg font-medium flex justify-between">
                <button class="btn btn-circle" on:click={() => removeInsight(i)}>
                    <Icon data={mdiDelete} />
                </button>
                <span class="my-auto">{getLogName(s.insightId)}</span>
            </div>
            <div class="collapse-content p-0"> 
                <InsightEditorSeries series={s} index={i} on:series={(e) => onSeries(i, e.detail)}/>
            </div>
        </div>
    {/each}
</div>
