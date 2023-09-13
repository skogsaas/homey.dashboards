<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';

    export let open: boolean;

    let value: string = '';
    const dispatch = createEventDispatcher();

    function onCreate() {
        dispatch('value', value);

        value = '';
        open = false;
        dispatch('open', open);
    }

    function onCancel() {
        value = '';
        open = false;
        dispatch('open', open);
    }
</script>

<Portal>
    {#if open}
        <Modal handleClose={onCancel}>
            <Modal.Content slot="content">
                <Modal.Content.Header slot="header">New local dashboard</Modal.Content.Header>
                <Modal.Content.Body slot="body">
                    <Input name="name" bind:value={value} placeholder="Dashboard name" />

                    <p class="mt-4">
                        NOTE:
                        Local dashboards are stored in the exact browser they are created in. This means that the dashboard will not
                        be available on any other devices. If you want the dashboard to be available on other devices, use the native Homey App
                        and add a new device of type <i>Dashboard</i>. This requires you to install the Homey Dashboards app.
                    </p>
                </Modal.Content.Body>
                <Modal.Content.Footer slot="footer">
                    <Button on:click={onCancel}>Cancel</Button>
                    <Button on:click={onCreate} disabled={value.length < 3}>Create</Button>
                </Modal.Content.Footer>
            </Modal.Content>
        </Modal>
    {/if}
</Portal>