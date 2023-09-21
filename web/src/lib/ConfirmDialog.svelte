<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Button from 'stwui/button';

    export let open: boolean;
    export let title: string = 'Confirm'
    export let text: string;
    export let cancelText: string = 'Cancel';
    export let confirmText: string = 'Confirm';

    const dispatch = createEventDispatcher();

    function onConfirm() {
        dispatch('confirm', true);

        open = false;
        dispatch('open', open);
    }

    function onCancel() {
        dispatch('cancel', true);

        open = false;
        dispatch('open', open);
    }
</script>

<Portal>
    {#if open}
        <Modal handleClose={onCancel}>
            <Modal.Content slot="content">
                <Modal.Content.Header slot="header"><h2>{title}</h2></Modal.Content.Header>
                <Modal.Content.Body slot="body">{text}</Modal.Content.Body>
                <Modal.Content.Footer slot="footer">
                    <Button on:click={onCancel}>{cancelText}</Button>
                    <Button on:click={onConfirm}>{confirmText}</Button>
                </Modal.Content.Footer>
            </Modal.Content>
        </Modal>
    {/if}
</Portal>