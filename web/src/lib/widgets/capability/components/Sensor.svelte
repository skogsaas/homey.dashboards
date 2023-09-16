<script lang="ts">
    import { mdiAlert, mdiCheck } from '$lib/components/icons';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import { formatDistance } from 'date-fns'

    import Icon from 'stwui/icon';

    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'item'|'view';
    
    $: value = capability?.value;
</script>

{#if capability !== undefined}
    {#if mode === 'item'}
        {#if capability.id.startsWith('alarm_')}
            {#if value}
                <Icon class="bg-warn-icon" data={mdiAlert} />
            {:else}
                <Icon data={mdiCheck} />
            {/if}
        {:else}
            {#if capability.type === 'boolean'}
                <span>{value ? 'Yes' : 'No'}</span>
            {:else if capability.type === 'enum'}
                <span>{capability.values.find(v => v.id === value)?.title ?? value}</span>
            {:else}
                <span class="whitespace-nowrap">{value} {capability?.units ?? ''}</span>
            {/if}
        {/if}
    {:else}
        <div class="flex flex-col w-full">
            {#if capability.id.startsWith('alarm_')}
                {#if value}
                    <Icon class="bg-warn-icon" data={mdiAlert} />
                {:else}
                    <Icon data={mdiCheck} />
                {/if}
            {:else}
                {#if capability.type === 'boolean'}
                    <h1>{value ? 'Yes' : 'No'}</h1>
                {:else if capability.type === 'enum'}
                    <h1>{capability.values.find(v => v.id === value)?.title ?? value}</h1>
                {:else}
                    <h1 class="whitespace-nowrap">{value} {capability?.units ?? ''}</h1>
                {/if}
            {/if}

            <span>{capability.title}</span>

            {#if capability.lastUpdated}
                <span class="font-extralight">{formatDistance(new Date(capability.lastUpdated), new Date(), { addSuffix: true })}</span>
            {/if}
        </div>
    {/if}
{/if}