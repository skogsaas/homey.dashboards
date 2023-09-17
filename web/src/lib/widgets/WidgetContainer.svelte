<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { editing } from '$lib/stores/dashboard';
    
    import Card from 'stwui/card';
    import Button from 'stwui/button';

    import {  mdiArrowTopLeftBottomRight, mdiCog, mdiCursorMove, mdiDelete, mdiLock, mdiLockOpenVariant } from '$lib/components/icons';

    const dispatch = createEventDispatcher();

    export let fixed: boolean;
    export let move: any;
    export let resize: any;

    let moving: boolean = false;

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
            <Button on:click={onEdit} shape="circle" size="xs" type="default">
                <Button.Icon slot="icon" data={mdiCog} />
            </Button>

            <Button on:click={onFixed} shape="circle" size="xs" type="default">
                <Button.Icon slot="icon" data={fixed ? mdiLock : mdiLockOpenVariant} />
            </Button>

            {#if !fixed}
                <Button on:pointerdown={move} class="touch-none" shape="circle" size="xs" type="default">
                    <Button.Icon slot="icon" data={mdiCursorMove} />
                </Button>
            {/if}

            <Button on:click={onDelete} shape="circle" size="xs" type="default" class="ml-auto">
                <Button.Icon slot="icon" data={mdiDelete} color="red" />
            </Button>
        </div>

        {#if !fixed}
            <Button on:pointerdown={resize} shape="circle" size="xs" type="default" class="absolute z-10 -right-3 -bottom-3 touch-none">
                <Button.Icon slot="icon" data={mdiArrowTopLeftBottomRight} />
            </Button>
        {/if}
    {/if}
    
    <slot></slot>
</Card>