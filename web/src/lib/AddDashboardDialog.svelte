<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let open: boolean;

    $: if(modal !== undefined) { open ? modal.show() : modal.close() }

    let modal: HTMLDialogElement;
    let value: string = '';
    const dispatch = createEventDispatcher();

    function onCreate() {
        dispatch('value', value);
        onCancel();
    }

    function onCancel() {
        value = '';
        open = false;
        dispatch('open', open);
    }
</script>

<dialog bind:this={modal} class="modal">
    <div class="modal-box flex flex-col">
        <div class="flex-shrink-0 mb-2">            
            <label class="form-control w-full">
                <div class="label">
                    <span class="label-text">New browser dashboard</span>
                </div>
                <input type="text" class="input w-full" placeholder="Dashbard name" bind:value={value} />
            </label>
        </div>
        
        <div class="flex-grow overflow-auto">
            <p class="mt-4">
                NOTE:
                Local dashboards you create in this browser, are stored in this browser. This means that the dashboard will not
                be available on any other devices. If you want the dashboard to be available on other devices, use the native Homey App
                and add a new device of type <i>Dashboard</i>. This requires you to install the Homey Dashboards app.
            </p>
        </div>

        <div class="flex-shrink-0 mt-4">
            <form method="dialog" class="flex justify-end w-full mb-4">
                <button class="btn" on:click={onCancel}>Cancel</button>
                <button class="btn" on:click={onCreate} disabled={value.length < 3}>Create</button>
            </form>
        </div>
    </div>
</dialog>