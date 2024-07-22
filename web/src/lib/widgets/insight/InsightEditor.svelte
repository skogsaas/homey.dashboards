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

    interface Option {
        value: string;
        label: string;
    }

    const resolutions: Option[] = [
        { value: 'lastHour', label: 'Last hour' },
        { value: 'last6Hours', label: 'Last 6 hours' },
        { value: 'last24Hours', label: 'Last 24 hours' },
        { value: 'last7Days', label: 'Last 7 days' },
        { value: 'last14Days', label: 'Last 14 days' },
        { value: 'last31Days', label: 'Last 31 days' },
        { value: 'today', label: 'Today' },
        { value: 'thisWeek', label: 'This week' },
        { value: 'thisMonth', label: 'This month' },
        { value: 'thisYear', label: 'This year' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'lastWeek', label: 'Last week' },
        { value: 'lastMonth', label: 'Last month' },
        { value: 'lastYear', label: 'Last year' },
        { value: 'last2Years', label: 'Last 2 years' },
    ];

    export let settings: InsightSettings_v5;

    let openInsightId: string | undefined;
    let resolution: string;
    let series: Series_v5[] = [];

    let selectedLogId: string | undefined;

    $: onSettings(settings);
    $: onResolution(resolution);

    function onSettings(s: InsightSettings_v5) {
        resolution = settings.resolution ?? 'today';
        series = [...settings?.series ?? []];
    };

    function onResolution(_resolution: string) {
        if(_resolution === settings.resolution) {
            return;
        }

        dispatch('settings', { ...settings, resolution: _resolution });
    }

    function onLog(logId: string) {
        series = [...series, { insightId: logId }];

        selectedLogId = undefined;

        dispatch('settings', { ...settings, series });
    }

    function onSeries(index: number, s: Series_v5) {
        const updatedSeries = [...series];
        updatedSeries[index] = { ...s };

        series = updatedSeries;

        dispatch('settings', { ...settings, series });
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

        dispatch('settings', { ...settings, series });
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

<select bind:value={resolution} class="select w-full mt-4">
    {#each resolutions as option}
        <option value={option}>{option.label}</option>
    {/each}
</select>

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
