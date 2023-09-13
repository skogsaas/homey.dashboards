<script lang="ts">
    import { mdiAlarm, mdiAlert, mdiCheck } from '$lib/components/icons';
    import type { CapabilityObj } from '$lib/types/Homey';

    import Icon from 'stwui/icon';

    export let capability: CapabilityObj;
    export let controllable: boolean;
    
    $: value = capability?.value;
</script>

{#if capability !== undefined}
    {#if capability.id.startsWith('alarm_')}
        {#if value}
            <Icon style="color: red;" data={mdiAlert} />
        {:else}
            <Icon data={mdiCheck} />
        {/if}
    {:else}
        {#if capability.type === 'boolean'}
            <span>{value ? 'Yes' : 'No'}</span>
        {:else}
            <span class="whitespace-nowrap">{value} {capability?.units ?? ''}</span>
        {/if}
    {/if}
{/if}