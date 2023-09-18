<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { editing } from '$lib/stores/dashboard';
    
    import Card from 'stwui/card';
    import Button from 'stwui/button';

    import {  mdiArrowTopLeftBottomRight, mdiCog, mdiCursorMove, mdiDelete, mdiLock, mdiLockOpenVariant } from '$lib/components/icons';
    import IconButton from '$lib/components/IconButton.svelte';

    const dispatch = createEventDispatcher();

    export let fixed: boolean;
    export let move: any;
    export let resize: any;

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

<Card on:click class="h-full w-full overflow-hidden">
    {#if $editing}
        <div class="absolute z-10 -top-4 left-0 flex w-full">
            <IconButton on:click={onEdit} data={mdiCog} />
            <IconButton on:click={onFixed} data={fixed ? mdiLock : mdiLockOpenVariant} />
            
            {#if !fixed}
                <IconButton on:pointerdown={move} data={mdiCursorMove} class="touch-none" />
            {/if}

            <IconButton on:click={onDelete} data={mdiDelete} class="ml-auto" color="red" />
        </div>

        {#if !fixed}
            <IconButton on:pointerdown={resize} data={mdiArrowTopLeftBottomRight} class="absolute z-10 -right-3 -bottom-3 touch-none" />
        {/if}
    {/if}
    
    <slot></slot>
</Card>