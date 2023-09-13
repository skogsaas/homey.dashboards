<script lang="ts">
    import { advancedFlows, basicFlows, devices, homey } from '$lib/stores/homey';

    import type FlowSettings from './FlowSettings';
    import type { Flow, InsightObj, LogEntries } from '$lib/types/Homey';

    import { editing } from '$lib/stores/dashboard';

    import Button from "stwui/button";
    import Icon from "stwui/icon";
    
    import { mdiPlay } from '$lib/components/icons';

    export let settings: FlowSettings;

    $: flow = settings?.flowId !== undefined ? $basicFlows[settings.flowId] as Flow ?? $advancedFlows[settings.flowId] as Flow : undefined;   

    async function triggerFlow() {
        if(!$editing && flow !== undefined) {
            if($basicFlows[flow.id]) {
                await $homey.flow.triggerFlow({ id: flow.id });
            } else if($advancedFlows[flow.id]) {
                await $homey.flow.triggerAdvancedFlow({ id: flow.id });
            }
        }
    }
</script>

{#if flow === undefined}
    <span>Error</span>
{:else}
<div class="flex content-center h-full">
    <Button class="my-auto ml-1" type="primary" shape="circle" size="fab" on:click={() => triggerFlow()}>
        <Button.Icon slot="icon" data={mdiPlay} />
    </Button>
    
    <div class="my-auto ml-3 mr-1">{flow.name}</div>
</div>
    
{/if}