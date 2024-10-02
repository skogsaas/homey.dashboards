<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let open: boolean;
    export let title: string = 'Confirm'
    export let text: string;
    export let cancelText: string = 'Cancel';
    export let confirmText: string = 'Confirm';

    $: if(modal !== undefined) { open ? modal.show() : modal.close() }

    const dispatch = createEventDispatcher();

    let modal: HTMLDialogElement;

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

<dialog bind:this={modal} class="modal">
    <div class="modal-box flex flex-col">
        <div class="flex-shrink-0 mb-2">            
            <h2>{title}</h2>
        </div>
        
        <div class="flex-grow overflow-auto">
            {text}
        </div>

        <div class="flex-shrink-0 mt-4">
            <form method="dialog" class="flex justify-end w-full mb-4">
                <button class="btn" on:click={onCancel}>{cancelText}</button>
                <button class="btn" on:click={onConfirm}>{confirmText}</button>
            </form>
        </div>
    </div>
</dialog>