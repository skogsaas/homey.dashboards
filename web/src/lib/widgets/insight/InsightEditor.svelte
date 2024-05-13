<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { devices, insights } from '$lib/stores/homey';

    import type { InsightSettings_v5 } from "./InsightSettings";
    import type { Series_v5 } from './InsightSettings';

    import Button from 'stwui/button';
    import Select from 'stwui/select';
    import Accordion from 'stwui/accordion'

    import InsightPicker from '$lib/components/InsightPicker.svelte';
    import InsightEditorSeries from './InsightEditorSeries.svelte';
    import { mdiDelete } from '$lib/components/icons';
    import { Icon } from 'stwui';
    
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
        { value: 'last2Years', label: 'Last 2 years' }
    ];

    export let settings: InsightSettings_v5;

    let openInsightId: string | undefined;
    let resolution: Option;
    let series: Series_v5[] = [];

    let selectedLogId: string | undefined;

    $: onSettings(settings);
    $: onResolution(resolution);

    function onSettings(s: InsightSettings_v5) {
        resolution = resolutions.find(r => r.value === (settings.resolution ?? 'today'))!;
        series = [...settings?.series ?? []];
    };

    function onResolution(option: Option) {
        if(option.value === settings.resolution) {
            return;
        }

        dispatch('settings', { ...settings, resolution: option.value });
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
