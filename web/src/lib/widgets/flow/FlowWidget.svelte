<script lang="ts">
    import { advancedFlows, basicFlows, devices, homey } from '$lib/stores/homey';

    import type FlowSettings from './FlowSettings';
    import type { Flow, InsightObj, LogEntries } from '$lib/types/Homey';

    import Fab, { Label, Icon } from '@smui/fab';
    import { editing } from '$lib/stores/dashboard';

    export let settings: FlowSettings;

    $: flow = settings?.flowId !== undefined ? $basicFlows[settings.flowId] as Flow ?? $advancedFlows[settings.flowId] as Flow : undefined;   

    async function triggerFlow() {
        if(!$editing && flow !== undefined) {
            if($basicFlows[flow.id]) {
                console.log(await $homey.flow.triggerFlow({ id: flow.id }));
            } else if($advancedFlows[flow.id]) {
                console.log(await $homey.flow.triggerAdvancedFlow({ id: flow.id }));
            }
        }
    }
</script>

{#if flow === undefined}
    <span>Error</span>
{:else}
<div class="flow-container">
    <div class="flow-button">
        <Fab on:click={() => triggerFlow()}>
            <Icon class="material-icons">play_arrow</Icon>
        </Fab>
    </div>

    <Label>{flow.name}</Label>
</div>
    
{/if}

<style>
    .flow-container {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
    }

    .flow-button {
        margin-right: 5px;
    }
</style>