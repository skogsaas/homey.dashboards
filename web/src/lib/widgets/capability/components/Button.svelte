<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import Button from 'stwui/button';
    import { createEventDispatcher } from 'svelte';

    const dispatcher = createEventDispatcher();

    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'item'|'view';

    //$: value = capability?.value;
    $: disabled = !controllable || $editing;

    function setValue(value: boolean) {
        dispatcher('value', value);
    }
</script>

{#if capability}
    {#if mode === 'item'}
        <Button type="primary" on:click={() => setValue(true)} {disabled}>{capability.title}</Button>
    {:else}
        <div class="flex justify-center">
            <Button size="xl" type="primary" on:click={() => setValue(true)} {disabled}>{capability.title}</Button>
        </div>
    {/if}
{/if}