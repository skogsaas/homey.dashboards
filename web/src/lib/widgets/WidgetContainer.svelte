<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { editing } from '$lib/stores/dashboard';
    
    import Card from 'stwui/card';
    import Button from 'stwui/button';
    import Dropdown from 'stwui/dropdown';

    import { mdiCog, mdiDelete, mdiLock, mdiLockOpenVariant, mdiMenu } from '$lib/components/icons';

    const dispatch = createEventDispatcher();

    export let fixed: boolean;

    let menuOpen: boolean = false;

    function onEdit() {
        menuOpen = false;
        dispatch('edit');
    }

    function onFixed() {
        menuOpen = false;
        dispatch('fixed', !fixed);
    }

    function onDelete() {
        menuOpen = false;
        dispatch('delete');
    }
</script>

<Card on:click class="h-full w-full overflow-hidden flex flex-col justify-start">
    {#if $editing}
        <div class="absolute -top-4 -left-4 z-10">
            <Dropdown bind:visible={menuOpen}>
                <Button slot="trigger" shape="circle" size="xs" type="primary" on:click={(e) => (menuOpen = true)}>
                    <Button.Icon data={mdiMenu} />
                </Button>

                <Dropdown.Items slot="items">
                    <Dropdown.Items.Item on:click={onEdit} label="Edit">
                        <Dropdown.Items.Item.Icon slot="icon" data={mdiCog} />
                    </Dropdown.Items.Item>

                    <Dropdown.Items.Item on:click={onFixed} label={fixed ? 'Unlock' : 'Lock'}>
                        <Dropdown.Items.Item.Icon slot="icon" data={fixed ? mdiLock : mdiLockOpenVariant} />
                    </Dropdown.Items.Item>

                    <Dropdown.Items.Item type="danger" on:click={onDelete} label="Delete">
                        <Dropdown.Items.Item.Icon slot="icon" data={mdiDelete} color="red" />
                    </Dropdown.Items.Item>
                </Dropdown.Items>
            </Dropdown>
        </div>
    {/if}
    
    <slot></slot>
</Card>