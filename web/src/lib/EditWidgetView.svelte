<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { findEditor, findWidget } from './widgets';
    import type { WidgetSettings } from './types/Widgets';
    import type { GridItem } from './types/Grid';

    import Button from "stwui/button";
    import Divider from "stwui/divider";

    import Drawer from './components/Drawer.svelte';

    export let open: boolean = false;
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

{#if open}
    <Drawer bind:open position="right" size="md">
        {#if item !== undefined && localSettings !== undefined}
            <div>
                <Button type="primary" on:click={save}>Save</Button>
                <Button on:click={cancel}>Cancel</Button>
            </div>

            <Divider>
                <Divider.Label slot="label">Preview</Divider.Label>
            </Divider>

            <div class="w-full">
                <svelte:component 
                    this={findWidget(item.settings.type)}
                    settings={localSettings}
                />
            </div>

            <Divider>
                <Divider.Label slot="label">Settings</Divider.Label>
            </Divider>

            <div class="mt-5">
                <svelte:component 
                    this={findEditor(item.settings.type)}
                    settings={localSettings}
                    on:settings={(e) => localSettings = e.detail}
                />
            </div>
        {/if}
    </Drawer>
{/if}