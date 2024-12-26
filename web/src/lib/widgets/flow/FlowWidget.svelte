<script lang="ts">
    import { advancedFlows, basicFlows, homey } from '$lib/stores/homey';

    import type { FlowSettings_v1 } from './FlowSettings';
    import type { Flow } from '$lib/types/Homey';

    import { editing } from '$lib/stores/editing';
    
    import { getIcon } from '$lib/components/icons/utils';
    import Icon from '$lib/components/Icon.svelte'
    import type { WidgetContext } from '$lib/types/Widgets';

    export let context: WidgetContext;
    export let settings: FlowSettings_v1;

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
    {#if settings.flowId === undefined}
        <span>Flow not configured</span>
    {:else}
        <span>Flow not found</span>
    {/if}
{:else}
    <div class="flex w-full h-full">
        <button class="btn btn-circle my-auto btn-lg btn-success" on:click={() => triggerFlow()}>
            <Icon data={getIcon(settings.iconId ?? 'play')} />
        </button>
        
        <div class="my-auto ml-3 mr-1">{settings.title ?? flow.name}</div>
    </div>
{/if}