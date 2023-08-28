<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import Button, { Label } from '@smui/button';

    export let open: boolean;
    export let text: string;
    export let cancelText: string = 'Cancel';
    export let confirmText: string = 'Confirm';

    const dispatch = createEventDispatcher();

    function closeHandler(e: CustomEvent<{ action: string }>) {
        dispatch(e.detail.action, true);
    }
</script>

<Dialog 
    selection
    bind:open
    on:SMUIDialog:closed={closeHandler}
>
    <Title>Create local dashboard</Title>
    <Content style="margin: 5px;">
        {text}
    </Content>
    <Actions>
        <Button action="cancel">
            <Label>{cancelText}</Label>
        </Button>
        <Button action="confirm">
            <Label>{confirmText}</Label>
        </Button>
    </Actions>
</Dialog>