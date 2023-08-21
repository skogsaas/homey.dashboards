<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj } from '$lib/types/Homey';

    import Switch from '@smui/switch';
    import { createEventDispatcher } from 'svelte';

    const dispatcher = createEventDispatcher();

    export let capability: CapabilityObj;
    export let controllable: boolean;
    
    $: value = capability?.value;
    $: disabled = !controllable || $editing;

    function setValue(value: boolean) {
        dispatcher('value', value);
    }
</script>

{#if capability !== null && capability !== undefined}
    <Switch
        checked={value} 
        on:SMUISwitch:change={e => setValue(e.detail.selected)} 
        disabled={disabled} 
    />
{:else}
    Null
{/if}