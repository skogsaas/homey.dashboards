<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import List, { Item, Graphic, Text } from '@smui/list';
    import Button, { Label } from '@smui/button';
    import Radio from '@smui/radio';

    import { widgets } from './widgets/widgets';

    export let open: boolean;

    let selection: string | undefined;
    const dispatch = createEventDispatcher();

    function closeHandler(e: CustomEvent<{ action: string }>) {
        if (e.detail.action === 'accept') {
            dispatch('selected', selection);
        }

        selection = undefined;
    }
</script>

<Dialog 
    selection
    bind:open
    on:SMUIDialog:closed={closeHandler}
>
    <Title>Select widget</Title>
    <Content>
        <List>
            {#each widgets as widget}
                <Item>
                    <Graphic>
                        <Radio bind:group={selection} value={widget.type} />
                    </Graphic>
                    <Text>{widget.label}</Text>
                </Item>
            {/each}
        </List>
    </Content>
    <Actions>
        <Button>
            <Label>Cancel</Label>
        </Button>
        <Button action="accept" disabled={selection === undefined}>
            <Label>Add {selection ?? ''}</Label>
        </Button>
    </Actions>
</Dialog>