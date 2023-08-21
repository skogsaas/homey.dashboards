<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { findEditor, findWidget } from './widgets/widgets';
    import type { WidgetSettings } from './types/Widgets';
    import type { GridItem } from './types/Grid';

    import Card from '@smui/card';
    import Button from '@smui/button';

    export let item: GridItem | undefined;

    const dispatch = createEventDispatcher();

    let localSettings: WidgetSettings | undefined;
    $: onItem(item);

    function onItem(i: GridItem | undefined) {
        if(item === undefined) {
            localSettings = undefined;
        } else {
            // Make a copy of the settings to use until it is saved by the user.
            localSettings = { ...item?.settings }
        }
    }

    function cancel() {
        if(item !== undefined) { 
            // Reset the local settings
            localSettings = { ...item.settings }
        };

        // Dispatch settings to trigger closing the editor.
        dispatch('settings', localSettings);
    }

    function save() {
        dispatch('settings', localSettings);
    }
</script>

{#if item !== undefined && localSettings !== undefined}
    <div class="preview">
        <Card variant="outlined">
            <svelte:component 
                this={findWidget(item.settings.type)}
                settings={localSettings}
            />       
        </Card>
    </div>


    <div class="editor">
        <svelte:component 
            this={findEditor(item.settings.type)}
            settings={localSettings}
            on:settings={(e) => localSettings = e.detail}
        />
    </div>

    <div>
        <Button on:click={cancel}>Cancel</Button>
        <Button on:click={save}>Save</Button>
    </div>    
{/if}

<style>
    .editor {
        margin: 5px;
        margin-right: 15px;
    }

    .preview {
        width: calc(100% - 10px);
        margin: 5px;
    }
</style>