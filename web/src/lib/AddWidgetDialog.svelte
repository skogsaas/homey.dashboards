<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { hasRequiredScopes, widgets } from './widgets';
    import { scopes } from './stores/homey';

    import Portal from "stwui/portal";
    import Modal from "stwui/modal";
    import List from "stwui/list";

    export let open: boolean;

    const dispatch = createEventDispatcher();

    function onSelect(selected: string) {
        dispatch('selected', selected);

        open = false;
        dispatch('open', open);
    }

    function onCancel() {
        open = false;
        dispatch('open', open);
    }
</script>

<Portal>
    {#if open}
        <Modal handleClose={onCancel}>
            <Modal.Content slot="content">
                <Modal.Content.Body slot="body">
                    <List>
                        {#each widgets as widget}
                            {#if hasRequiredScopes(widget.type, $scopes)}
                                <List.Item class="cursor-pointer" on:click={() => onSelect(widget.type)}>{widget.label}</List.Item>
                            {/if}
                        {/each}
                    </List>
                </Modal.Content.Body>
            </Modal.Content>
        </Modal>
    {/if}
</Portal>