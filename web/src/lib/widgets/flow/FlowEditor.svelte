<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { advancedFlows, basicFlows } from '$lib/stores/homey';

    import type FlowSettings from "./FlowSettings";
    import type { Flow } from '../../types/Homey';

    import FlowPicker from '$lib/components/FlowPicker.svelte';

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

<FlowPicker bind:flowId={flowId} flows={flows} />