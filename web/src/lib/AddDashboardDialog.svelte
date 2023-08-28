<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import Button, { Label } from '@smui/button';
    import Textfield from '@smui/textfield';

    export let open: boolean;

    let value: string = '';
    const dispatch = createEventDispatcher();

    function closeHandler(e: CustomEvent<{ action: string }>) {
        if (e.detail.action === 'accept') {
            dispatch('value', value);
        }

        value = '';
    }
</script>

<Dialog 
    selection
    bind:open
    on:SMUIDialog:closed={closeHandler}
>
    <Title>Create local dashboard</Title>
    <Content style="margin: 5px;">
        <Textfield bind:value style="width: 100%" label="Dashboard name">
        </Textfield>
    </Content>
    <Actions>
        <Button>
            <Label>Cancel</Label>
        </Button>
        <Button action="accept" disabled={value.length < 3}>
            <Label>Create</Label>
        </Button>
    </Actions>
</Dialog>