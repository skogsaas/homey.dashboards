<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import Select, { Option } from "@smui/select";
    import type InsightSettings from "./InsightSettings";
    import type { InsightObj, DeviceObj, DeviceMap, Homey } from '../../types/Homey';

    export let settings: InsightSettings;
    export let devices: DeviceMap;
    
    export let homey: Homey;

    const dispatch = createEventDispatcher();

    let device: DeviceObj | null = null;
    let insight: InsightObj | undefined;

    $: flatDevices = Object.values(devices).sort((a, b) => {
        if(a.name === b.name) return 0;
        if(a.name < b.name) return -1;
        return 1;
    });
    $: insights = device?.insights ?? [];

    $: deviceId = onDevice(device);
    $: insightId = oninsight(insight);

    onMount(() => {
        if(settings.deviceId) {
            device = devices[settings.deviceId];
        }

        if(device && settings.insightId) {
            insight = device.insights.find(i => i.id === settings.insightId);
        }
    });

    function onDevice(value: DeviceObj | null) : string | null {
        if(value == null || value.id === settings.deviceId) {
            return null;
        }

        device = value;
        settings.deviceId = value.id;

        // Reset the insight after changing device
        insight = undefined;
        settings.insightId = null;

        dispatch('settings', settings);

        return settings.deviceId;
    }

    function oninsight(value: InsightObj | undefined) : string | null {
        if(value == null || value.id === settings.insightId) {
            return null;
        }

        insight = value;
        settings.insightId = value.id;

        dispatch('settings', settings);

        return settings.insightId;
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
    <Select bind:value={insight} label="insight">
        {#each insights as i}
            <Option value={i}>{i.title}</Option>
        {/each}
    </Select>
{/if}
</div>