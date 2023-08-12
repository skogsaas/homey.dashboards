<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { devices } from '$lib/stores/homey';

    import Select, { Option } from "@smui/select";
    import type InsightSettings from "./InsightSettings";

    export let settings: InsightSettings;

    const dispatch = createEventDispatcher();

    let deviceId: string | undefined;
    let insightId: string | undefined;
    let resolution: string | undefined;

    $: flatDevices = Object.values($devices).sort((a, b) => {
        if(a.name === b.name) return 0;
        if(a.name < b.name) return -1;
        return 1;
    });
    $: insights = deviceId ? $devices[deviceId].insights : [];

    $: onDevice(deviceId);
    $: onInsight(insightId);
    $: onResolution(resolution);

    onMount(() => {
        deviceId = settings.deviceId;
        insightId = settings.insightId;
        resolution = settings.resolution;
    });

    function onDevice(value: string | undefined) {
        if(value === undefined || value === settings.deviceId) {
            return;
        }

        settings.deviceId = value;

        // Reset the insight after changing device
        insightId = undefined;

        const s: InsightSettings = { ...settings, deviceId, insightId };
        dispatch('settings', s);
    }

    function onInsight(value: string | undefined) {
        if(value == null || value === settings.insightId) {
            return;
        }

        insightId = value;

        const s: InsightSettings = { ...settings, insightId };
        dispatch('settings', s);
    }

    function onResolution(value: string | undefined) {
        if(value == null || value === settings.resolution) {
            return;
        }

        resolution = value;

        const s: InsightSettings = { ...settings, resolution };
        dispatch('settings', s);
    }
</script>

<div>
    <Select bind:value={deviceId} label="Device">
        {#each flatDevices as flatDevice}
          <Option value={flatDevice.id}>{flatDevice.name}</Option>
        {/each}
    </Select>
</div>

<div>
{#if deviceId}
    <Select bind:value={insightId} label="Insight">
        {#each insights as insight}
            <Option value={insight.id}>{insight.title}</Option>
        {/each}
    </Select>
{/if}
</div>

<div>
    {#if deviceId && insightId}
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
    {/if}
</div>