<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { devices } from '$lib/stores/homey';

    import Select, { Option } from "@smui/select";
    import type InsightSettings from "./InsightSettings";
    import type { InsightObj, DeviceObj } from '../../types/Homey';

    export let settings: InsightSettings;

    const dispatch = createEventDispatcher();

    let device: DeviceObj | null = null;
    let insight: InsightObj | undefined;
    let resolution: string | undefined;

    $: flatDevices = Object.values($devices).sort((a, b) => {
        if(a.name === b.name) return 0;
        if(a.name < b.name) return -1;
        return 1;
    });
    $: insights = device?.insights ?? [];

    $: onDevice(device);
    $: onInsight(insight);
    $: onResolution(resolution);

    onMount(() => {
        if(settings.deviceId) {
            device = $devices[settings.deviceId];
        }

        if(device && settings.insightId) {
            insight = device.insights.find(i => i.id === settings.insightId);
        }
    });

    function onDevice(value: DeviceObj | null) {
        if(value == null || value.id === settings.deviceId) {
            return;
        }

        settings.deviceId = value.id;

        // Reset the insight after changing device
        insight = undefined;
        settings.insightId = null;

        dispatch('settings', settings);
    }

    function onInsight(value: InsightObj | undefined) {
        if(value == null || value.id === settings.insightId) {
            return;
        }

        settings.insightId = value.id;

        dispatch('settings', settings);
    }

    function onResolution(value: string | undefined) {
        if(value == null || value === settings.resolution) {
            return;
        }

        settings.resolution = value;

        dispatch('settings', settings);
    }
</script>

<div>
    <Select bind:value={device} label="Device">
        {#each flatDevices as flatDevice}
          <Option value={flatDevice}>{flatDevice.name}</Option>
        {/each}
    </Select>
</div>

<div>
{#if device}
    <Select bind:value={insight} label="Insight">
        {#each insights as i}
            <Option value={i}>{i.title}</Option>
        {/each}
    </Select>
{/if}
</div>

<div>
    {#if device && insight}
        <Select bind:value={resolution} label="Resolution">
            <Option value="lastHour">Last hour</Option>
            <Option value="last6Hours">Last 6 hours</Option>
            <Option value="last24Hours">Last 24 hours</Option>
            <Option value="last7Days">Last 7 days</Option>
            <Option value="last14Days">Last 14 days</Option>
            <Option value="last31Days">Last 31 days</Option>
            <Option value={null}>---</Option>
            <Option value="today">Today</Option>
            <Option value="thisWeek">This week</Option>
            <Option value="thisMonth">This month</Option>
            <Option value="thisYear">This year</Option>
            <Option value={null}>---</Option>
            <Option value="yesterday">Yesterday</Option>
            <Option value="lastWeek">Last week</Option>
            <Option value="lastMonth">Last month</Option>
            <Option value="lastYear">Last year</Option>
            <Option value="last2Years">Last 2 years</Option>
        </Select>    
    {/if}
</div>