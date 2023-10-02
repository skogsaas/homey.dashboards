<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import {dndzone} from "svelte-dnd-action";

    import { findCreate, findEditor, findWidget, widgets } from './widgets';
    import type { WidgetSettings } from './types/Widgets';
    import type { GridItem } from './types/Grid';

    import Button from "stwui/button";
    import Divider from "stwui/divider";
    import Tabs from 'stwui/tabs';

    import Drawer from './components/Drawer.svelte';
    import IconButton from './components/IconButton.svelte';
    import { mdiDelete } from './components/icons';

    export let open: boolean = false;
    export let item: GridItem | undefined;

    const dispatch = createEventDispatcher();

    let active: 'card'|'view' = 'card';

    let cardSettings: WidgetSettings[] = [];
    let viewSettings: WidgetSettings[] = [];
    let selectedWidget: WidgetSettings | undefined;

    $: onOpen(open);
    $: onActive(active);
    $: onItem(item);
    $: onSelectedSettings(selectedWidget);

    function onOpen(o: boolean) {
        if(o) {
            active = 'card';
        }
    }

    function onActive(a: string) {
        selectedWidget = undefined;
    }

    function onItem(i: GridItem | undefined) {
        if(item === undefined) {
            cardSettings = [];
            viewSettings = [];
        } else {
            // Make a copy of the settings to use until it is saved by the user.
            cardSettings = (item.card ?? []).map(s => ({ ...s }));
            viewSettings = (item.view ?? []).map(s => ({ ...s }));

            selectedWidget = cardSettings[0];
        }
    }

    function onSelectedSettings(settings: WidgetSettings | undefined) {
        if(settings !== undefined) {
            if(active === 'card') {
                const index = cardSettings.findIndex(s => s.id === settings.id);
                const copy = [...cardSettings];
                copy[index] = settings;

                cardSettings = copy;
            } else {
                const index = viewSettings.findIndex(s => s.id === settings.id);
                const copy = [...viewSettings];
                copy[index] = settings;

                viewSettings = copy;
            }
        }
    }

    function handleSort(e: any) {
        if(active === 'card') {
            cardSettings = e.detail.items;
        } else {
            viewSettings = e.detail.items;
        }
    }

    function addWidget(type: string) : void {
        if(type === undefined) {
          return;
        }

        const create = findCreate(type);

        if(create !== undefined) {
            const settings = create();

            if(active === 'card') {
                cardSettings = [...cardSettings, settings];
            } else {
                viewSettings = [...viewSettings, settings];
            }
        }
    }

    function removeWidget(id: string) {
        if(active === 'card') {
            cardSettings = cardSettings.filter(s => s.id !== id);
        } else {
            viewSettings = viewSettings.filter(s => s.id !== id);
        }
    }

    function cancel() {
        if(item !== undefined) { 
            // Reset the local settings
            onItem(item);
        };

        open = false;
    }

    function save() {
        dispatch('item', { ...item, card: cardSettings, view: viewSettings });
    }
</script>

{#if open}
    <Drawer bind:open position="right" size="md">
        {#if item !== undefined}
            <div>
                <Button type="primary" on:click={save}>Save</Button>
                <Button on:click={cancel}>Cancel</Button>
            </div>

            <Divider>
                <Divider.Label slot="label"></Divider.Label>
            </Divider>

            <div class="flex justify-evenly w-full flex-wrap">
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                {#each widgets as widget}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="flex items-center cursor-pointer" on:click={() => addWidget(widget.type)}>
                        <IconButton data={widget.icon} />
                        <span>{widget.label}</span>
                    </div>
                {/each}
            </div>

            <Tabs currentTab={active} variant="full-width">
                <Tabs.Tab key="card" href="#card" on:click={() => (active = 'card')}>Card</Tabs.Tab>
                <Tabs.Tab key="view" href="#view" on:click={() => (active = 'view')}>View</Tabs.Tab>
             </Tabs>

             <Divider>
                <Divider.Label slot="label">Preview</Divider.Label>
            </Divider> 

            <div use:dndzone={{ items: active === 'card' ? cardSettings : viewSettings, flipDurationMs: 200 }} on:consider={handleSort} on:finalize={handleSort} class="w-full">
                {#each (active === 'card' ? cardSettings : viewSettings) as settings(settings.id)}
                    {#if settings?.type !== undefined}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="w-full flex justify-between" on:click={e => selectedWidget = settings} class:border-2={selectedWidget === settings}>
                            <svelte:component 
                                this={findWidget(settings.type)}
                                settings={settings}
                                mode={active}
                            />

                            <div class="flex items-center">
                                <IconButton data={mdiDelete} on:click={() => removeWidget(settings.id)} />
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>

            <Divider>
                <Divider.Label slot="label">Settings</Divider.Label>
            </Divider>

            {#if selectedWidget}
                <div class="mt-5">
                    <svelte:component 
                        this={findEditor(selectedWidget.type)}
                        settings={selectedWidget}
                        on:settings={e => selectedWidget = e.detail}
                    />
                </div>
            {/if}
        {/if}
    </Drawer>
{/if}