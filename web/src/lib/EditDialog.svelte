<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import Button, { Label } from '@smui/button';

    import { findEditor, findWidget } from './widgets/widgets';
    import type { WidgetSettings } from './types/Widgets';
    import type { GridItem } from './types/Grid';
    import { grid } from './stores/dashboard';

    export let open: boolean;
    export let item: GridItem | undefined;

    let localSettings: WidgetSettings | undefined;
    $: if(item !== undefined && localSettings === undefined) { localSettings = { ...item.settings }};

    const dispatch = createEventDispatcher();

    function closeHandler(e: CustomEvent<{ action: string }>) {
        if (e.detail.action === 'accept') {
            dispatch('settings', localSettings);
        }

        item = undefined;
        localSettings = undefined;
    }
</script>

<Dialog
    fullscreen
    noContentPadding
    bind:open
    on:SMUIDialog:closed={closeHandler}
    style="overflow: visible;"
>
    <Title>Edit settings</Title>
    <Content>
        <div class="container">
            {#if item !== undefined && localSettings !== undefined}
                <div class="editor">
                    <svelte:component 
                        this={findEditor(item.settings.type)}
                        settings={localSettings}
                        on:settings={(e) => localSettings = e.detail}
                    />
                </div>

                <div class="preview" style={'width: ' + $grid.pxX * item[$grid.columns].w + 'px; height:' + $grid.pxY * item[$grid.columns].h + 'px;'}>
                    <svelte:component 
                        this={findWidget(item.settings.type)}
                        settings={localSettings}
                    />
                </div>
            {/if}
        </div>
    </Content>
    <Actions>
        <Button>
            <Label>Cancel</Label>
        </Button>
        <Button action="accept">
            <Label>Save</Label>
        </Button>
    </Actions>
</Dialog>

<style>
    .container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
    }

    .editor {
        margin: 5px;
        margin-right: 15px;
    }

    .preview {
        
    }
</style>