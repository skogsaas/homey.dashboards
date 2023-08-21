<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj } from '$lib/types/Homey';

    import Button, { Label } from '@smui/button';
    import { createEventDispatcher } from 'svelte';

    const dispatcher = createEventDispatcher();

    export let capability: CapabilityObj;
    export let controllable: boolean;

    //$: value = capability?.value;
    $: disabled = !controllable || $editing;

    function setValue(value: boolean) {
        dispatcher('value', value);
    }
</script>

{#if capability}
    <Button on:click={() => setValue(true)} {disabled}>
        <Label>{capability.title}</Label>
    </Button>
{/if}