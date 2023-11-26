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
    
    const dispatch = createEventDispatcher();

    interface Option {
        value: string;
        label: string;
    }

    const resolutions: Option[] = [
        {value: 'lastHour', label: 'Last hour'},
        {value: 'last6Hours', label: 'Last 6 hours'},
        {value: 'last24Hours', label: 'Last 24 hours'},
        {value: 'last7Days', label: 'Last 7 days'},
        {value: 'last14Days', label: 'Last 14 days'},
        {value: 'last31Days', label: 'Last 31 days'},
        {value: 'today', label: 'Today'},
        {value: 'thisWeek', label: 'This week'},
        {value: 'thisMonth', label: 'This month'},
        {value: 'thisYear', label: 'This year'},
        {value: 'yesterday', label: 'Yesterday'},
        {value: 'lastWeek', label: 'Last week'},
        {value: 'lastMonth', label: 'Last month'},
        {value: 'lastYear', label: 'Last year'},
        {value: 'last2Years', label: 'Last 2 years'}
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
        const updatedSeries = [...series, { insightId: logId }];

        selectedLogId = undefined;

        dispatch('settings', { ...settings, series: updatedSeries });
    }

    function onSeries(index: number, s: Series_v5) {
        const updatedSeries = [...series];
        updatedSeries[index] = s;

        dispatch('settings', { ...settings, series: updatedSeries });
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
        const updatedSeries = [...series.filter((s, i) => i !== index)];

        dispatch('settings', { ...settings, series: updatedSeries });
    }
</script>

<InsightPicker bind:logId={selectedLogId} on:logId={(e) => onLog(e.detail)} logs={Object.values($insights)} placeholder="Add insight" />

<Select bind:value={resolution} placeholder="Resolution" name="resolution" class="mt-4">
    <Select.Options slot="options" class="max-h-96 overflow-auto">
        {#each resolutions as option}
            <Select.Options.Option {option} />
        {/each}
    </Select.Options>
</Select>

<Accordion class="mt-4">
    {#each series as s, i}
        <Accordion.Item open={openInsightId === s.insightId} class="overflow-visible">
            <Accordion.Item.Title slot="title" on:click={() => openInsightId !== s.insightId ? (openInsightId = s.insightId) : (openInsightId = undefined)}>
                <div>
                    <Button class="mr-4" on:click={() => removeInsight(i)}>
                        <Button.Icon slot="icon" data={mdiDelete} />
                    </Button>
                    <span>{getLogName(s.insightId)}</span>
                </div>
            </Accordion.Item.Title>
            <Accordion.Item.Content slot="content" class="p-4">
                <InsightEditorSeries series={s} index={i} on:series={(e) => onSeries(i, e.detail)}/>
            </Accordion.Item.Content>
        </Accordion.Item>
    {/each}
</Accordion>

