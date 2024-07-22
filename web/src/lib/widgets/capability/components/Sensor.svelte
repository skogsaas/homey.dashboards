<script lang="ts">
    import { mdiAlert, mdiCheck, mdiMinus } from '$lib/components/icons';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import { formatDistance } from 'date-fns'

    import Icon from '$lib/components/Icon.svelte'
    import type { CapabilitySettings_v5 } from '../CapabilitySettings';
    import { getIcon } from '$lib/components/icons/utils';

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'card'|'view';
    
    $: value = capability?.value;
</script>

{#if capability !== undefined}
    {#if mode === 'card'}
        {#if capability.id.startsWith('alarm_')}
            {#if value}
                <Icon class="bg-warn-icon" data={mdiAlert} />
            {:else}
                <Icon data={mdiMinus} />
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
        <div class="flex items-center w-full">
                {#if settings.iconId !== undefined}
                    <Icon data={getIcon(settings.iconId)} class="mr-1" />
                {/if}
                
                <h3>{settings.title ?? capability.title}</h3>

                {#if capability.lastUpdated}
                    <span class="font-extralight ml-2 text-xs mr-auto">- {formatDistance(new Date(capability.lastUpdated), new Date(), { addSuffix: true })}</span>
                {/if}

            {#if capability.id.startsWith('alarm_')}
                {#if value}
                    <Icon class="bg-warn-icon" data={mdiAlert} />
                {:else}
                    <Icon data={mdiMinus} />
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
        </div>
    {/if}
{/if}