<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { advancedFlows, basicFlows, devices } from '$lib/stores/homey';

    import Select, { Option } from "@smui/select";
    import type FlowSettings from "./FlowSettings";
    import type { AdvancedFlow, Flow } from '../../types/Homey';

    export let settings: FlowSettings;

    const dispatch = createEventDispatcher();

    let flowId: string | undefined;

    $: flows = (Object.values($basicFlows) as Flow[])
        .concat(Object.values($advancedFlows) as Flow[])
        .filter(f => f.triggerable)
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });
    $: onFlow(flowId);

    onMount(() => {
        if(settings.flowId) {
            flowId = settings.flowId;
        }
    });

    function onFlow(value: string | undefined) {
        if(value === undefined || value === settings.flowId) {
            return;
        }

        settings.flowId = value;
        dispatch('settings', settings);
    }
</script>

<div>
    <Select bind:value={flowId} label="Flow">
        {#each flows as f}
          <Option value={f.id}>{f.name}</Option>
        {/each}
    </Select>
</div>