<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj } from '$lib/types/Homey';

    import Toggle from 'stwui/toggle';
    import { createEventDispatcher } from 'svelte';

    const dispatcher = createEventDispatcher();

    export let capability: CapabilityObj;
    export let controllable: boolean;
    
    let value: boolean;
    $: disabled = !controllable || $editing;

    $: onCapability(capability);
    $: onValue(value);

    function onCapability(c: CapabilityObj) {
        value = c.value;
    }

    function onValue(v: boolean) {
        if(v !== capability?.value) {
            if(!disabled) {
                dispatcher('value', v);
            }
        }
    }
</script>

{#if capability !== null && capability !== undefined}
    <Toggle
        name="toggle"
        bind:on={value}
    />
{:else}
    Null
{/if}