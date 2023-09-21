<script lang="ts">
    import { advancedFlows, basicFlows, homey } from '$lib/stores/homey';

    import type FlowSettings from './FlowSettings';
    import type { Flow } from '$lib/types/Homey';

    import { editing } from '$lib/stores/dashboard';
    
    import { mdiPlay } from '$lib/components/icons';
    import IconButton from '$lib/components/IconButton.svelte';

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
    <IconButton data={mdiPlay} class="my-auto ml-1 bg-primary text-primary-content" on:click={() => triggerFlow()} size="60px" />
    
    <div class="my-auto ml-3 mr-1">{flow.name}</div>
</div>
    
{/if}