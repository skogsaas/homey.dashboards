<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { devices, insights } from '$lib/stores/homey';

    import Select, { Option } from "@smui/select";
    import type InsightSettings from "./InsightSettings";

    export let settings: InsightSettings;

    const dispatch = createEventDispatcher();

    let selectedOwnerUri: string | undefined;

    let ownerUri: string | undefined;
    let insightId: string | undefined;
    let resolution: string;
    let aggregation: string;
    let sampleRate: number;

    $: onSettings(settings);

    $: ownerLogs = Object.values($insights).reduce((groups: any, log) => {
        const ownerUri = log.ownerUri;
        const group = groups[ownerUri] = groups[ownerUri] ?? [];
        group.push(log);

        return groups;
    }, {});
    $: owners = Object.keys(ownerLogs);

    $: onOwner(selectedOwnerUri);
    $: onInsight(insightId);
    $: onResolution(resolution);
    $: onAggregation(aggregation);
    $: onSampleRate(sampleRate);

    function onSettings(s: InsightSettings) {
        insightId = settings?.insightId;
        resolution = settings?.resolution ?? 'today';
        aggregation = settings?.aggregation ?? 'none';
        sampleRate = settings?.sampleRate ?? 60;

        if(insightId !== undefined) {
            ownerUri = $insights[insightId].ownerUri;
            selectedOwnerUri = ownerUri;
        }
    };

    function onOwner(value: string | undefined) {
        if(value === ownerUri) {
            return;
        }

        ownerUri = value;

        // Reset the insight after changing ownerUri
        insightId = undefined;
    }

    function onInsight(value: string | undefined) {
        if(value == undefined || value === settings.insightId) {
            return;
        }

        dispatch('settings', { ...settings, insightId });
    }

    function onResolution(value: string | undefined) {
        if(value == undefined || value === settings.resolution) {
            return;
        }

        dispatch('settings', { ...settings, resolution });
    }

    function onAggregation(value: string | undefined) {
        if(value == undefined || value === settings.aggregation) {
            return;
        }

        dispatch('settings', { ...settings, aggregation });
    }

    function onSampleRate(value: number | undefined) {
        if(value == undefined || value === settings.sampleRate) {
            return;
        }

        dispatch('settings', { ...settings, sampleRate });
    }

    function getOwnerUriName(uri: string) {
        if(uri.startsWith('homey:device:')) {
            const prefix = 'homey:device:';
            const id = uri.slice(prefix.length);

            return $devices[id].name;
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
</script>

<div>
    <Select bind:value={selectedOwnerUri} label="Source">
        {#each owners as owner}
          <Option value={owner}>{getOwnerUriName(owner)}</Option>
        {/each}
    </Select>
</div>

<div>
{#if ownerUri}
    <Select bind:value={insightId} label="Insight">
        {#each ownerLogs[ownerUri] as insight}
            <Option value={insight.id}>{insight.title}</Option>
        {/each}
    </Select>
{/if}
</div>

{#if ownerUri && insightId}
    <div>
        <Select bind:value={resolution} label="Resolution">
            <Option value="lastHour">Last hour</Option>
            <Option value="last6Hours">Last 6 hours</Option>
            <Option value="last24Hours">Last 24 hours</Option>
            <Option value="last7Days">Last 7 days</Option>
            <Option value="last14Days">Last 14 days</Option>
            <Option value="last31Days">Last 31 days</Option>
            <Option value="today">Today</Option>
            <Option value="thisWeek">This week</Option>
            <Option value="thisMonth">This month</Option>
            <Option value="thisYear">This year</Option>
            <Option value="yesterday">Yesterday</Option>
            <Option value="lastWeek">Last week</Option>
            <Option value="lastMonth">Last month</Option>
            <Option value="lastYear">Last year</Option>
            <Option value="last2Years">Last 2 years</Option>
        </Select>
    </div>

    <div>
        <Select bind:value={aggregation} label="Aggregation">
            <Option value="none">No aggregation</Option>
            <Option value="min">Min</Option>
            <Option value="max">Max</Option>
            <Option value="sum">Sum</Option>
            <Option value="avg">Avg</Option>
            <Option value="first">First</Option>
            <Option value="last">Last</Option>
        </Select>

        {#if aggregation !== 'none'}
            <Select bind:value={sampleRate} label="Sample rate">
                <Option value="10">10 seconds</Option>
                <Option value="20">20 seconds</Option>
                <Option value="30">30 seconds</Option>
                <Option value="60">1 min</Option>
                <Option value="300">5 min</Option>
                <Option value="600">10 min</Option>
                <Option value="900">15 min</Option>
                <Option value="1200">20 min</Option>
                <Option value="1800">30 min</Option>
                <Option value="3600">1 hour</Option>
                <Option value="7200">2 hours</Option>
                <Option value="10800">3 hours</Option>
                <Option value="21600">6 hours</Option>
                <Option value="43200">12 hours</Option>
                <Option value="86400">24 hours</Option>
            </Select>
        {/if}
    </div>
{/if}