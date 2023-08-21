<script lang="ts">
    import type { CapabilityObj } from '$lib/types/Homey';
    import { Icon } from '@smui/common';

    export let capability: CapabilityObj;
    export let controllable: boolean;
    
    $: value = capability?.value;
</script>

{#if capability !== undefined}
    {#if capability.id.startsWith('alarm_')}
        {#if value}
            <Icon class="material-icons" style="color: red;">error</Icon>
        {:else}
            <Icon class="material-icons">check</Icon> 
        {/if}
    {:else}
        {#if capability.type === 'boolean'}
            <span>{value ? 'Yes' : 'No'}</span>
        {:else}
            <span>{value} {capability?.units ?? ''}</span>
        {/if}
    {/if}
{/if}