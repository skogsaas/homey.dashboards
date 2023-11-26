<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    import { editing, dashboard } from '$lib/stores/dashboard';
    
    import Card from 'stwui/card';

    import {  mdiArrowTopLeftBottomRight, mdiCog, mdiCursorMove, mdiDelete, mdiLock, mdiLockOpenVariant } from '$lib/components/icons';
    import IconButton from '$lib/components/IconButton.svelte';
    import { findWidget } from '$lib/widgets';
    import type { WidgetSettings } from '$lib/types/Widgets';

    const dispatch = createEventDispatcher();

    export let settings: WidgetSettings[];
    export let fixed: boolean;
    export let move: any;
    export let resize: any;

    $: context = { editing: false, mode: 'card' };

    function onEdit() {
        dispatch('edit');
    }

    function onFixed() {
        dispatch('fixed', !fixed);
    }

    function onDelete() {
        dispatch('delete');
    }
</script>

<Card on:click class="h-full w-full overflow-hidden flex flex-col">
    {#if $editing}
        <div class="absolute z-10 -top-4 left-0 flex w-full">
            <IconButton on:click={onEdit} data={mdiCog} size="18px" />
            <IconButton on:click={onFixed} data={fixed ? mdiLock : mdiLockOpenVariant} size="18px" />
            
            {#if !fixed}
                <IconButton on:pointerdown={move} data={mdiCursorMove} class="touch-none" size="18px" />
            {/if}

            <IconButton on:click={onDelete} data={mdiDelete} class="ml-auto" color="red" size="18px" />
        </div>

        {#if !fixed}
            <IconButton on:pointerdown={resize} data={mdiArrowTopLeftBottomRight} class="absolute z-10 -right-3 -bottom-3 touch-none" size="18px" />
        {/if}
    {/if}

    {#each settings as s(s.id)}
        <svelte:component 
            this={findWidget(s.type)}
            settings={s}
            {context}
        />
    {/each}
</Card>