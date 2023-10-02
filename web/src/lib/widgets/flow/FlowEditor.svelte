<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { advancedFlows, basicFlows } from '$lib/stores/homey';

    import type FlowSettings from "./FlowSettings";
    import type { Flow } from '../../types/Homey';

    import FlowPicker from '$lib/components/FlowPicker.svelte';
    import IconPicker from '$lib/components/IconPicker.svelte';

    export let settings: FlowSettings;

    const dispatch = createEventDispatcher();

    let flowId: string | undefined;
    let iconId: string | undefined;

    $: flows = (Object.values($basicFlows) as Flow[])
        .concat(Object.values($advancedFlows) as Flow[])
        .filter(f => f.triggerable)
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });

    $: onSettings(settings);
    $: onFlow(flowId);
    $: onIcon(iconId);

    function onSettings(s: FlowSettings) {
        flowId = s?.flowId;
        iconId = s?.iconId;
    }

    function onFlow(value: string | undefined) {
        if(value === undefined || value === settings.flowId) {
            return;
        }

        settings.flowId = value;
        dispatch('settings', settings);
    }

    function onIcon(id: string | undefined) {
        if(id !== settings.iconId) {
            dispatch('settings', { ...settings, iconId: id });
        }
    }
</script>

<FlowPicker bind:flowId={flowId} flows={flows} />

<div class="mt-2">
    <IconPicker bind:iconId={iconId} />
</div>