<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { homey } from '$lib/stores/homey';

    // Tailwind
    import Input from 'stwui/input';
    import Button from 'stwui/button';

    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import type { Capability_v3 } from './CapabilitySettings';
    import { mdiArrowDown, mdiArrowUp, mdiDelete } from '$lib/components/icons';

    const dispatch = createEventDispatcher();
    
    export let settings: Capability_v3;
    export let capability: CapabilityObj;
    export let index: number;
    export let capabilities: number;

    let title: string | undefined;

    $: onSettings(settings);
    $: onTitle(title);

    function onSettings(s: Capability_v3) {
        title = s.title;
    }

    function onTitle(value: string | undefined) {
        if(value === settings.title) {
            return;
        }

        dispatch('settings', { ...settings, title: value });
    }

    function moveUp() {
        dispatch('moveUp');
    }

    function moveDown() {
        dispatch('moveDown');
    }

    function remove() {
        dispatch('remove');
    }

</script>

{#await $homey.baseUrl then url}
    {#if capability.iconObj?.url}
        <img src={url + capability.iconObj.url} alt={capability.title} class="h-6 w-6 mr-2" />
    {/if}
{/await}

<Input name="title" bind:value={title} placeholder={capability.title} />
<div style="flex-grow: 1"></div>

{#if index > 0}
    <Button shape="circle" on:click={() => moveUp()}>
        <Button.Icon data={mdiArrowUp} />
    </Button>
{/if}

{#if index < (capabilities - 1)}
    <Button shape="circle" on:click={() => moveDown()}>
        <Button.Icon data={mdiArrowDown} />
    </Button>
{:else}
    <Button shape="circle"></Button>
{/if}

<Button shape="circle" on:click={() => remove()}>
    <Button.Icon data={mdiDelete} />
</Button>