<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { v4 as uuid } from 'uuid';
    
    import { findCreate, findEditor, findWidget, widgets as widgetTypes } from './widgets';
    import type { WidgetContext, WidgetSettings, WidgetSettingsMap } from './types/Widgets';
    import type { GridItemCollectionSettings_v2, GridItem_v1 } from './types/Grid';

    import Button from "stwui/button";
    import Divider from "stwui/divider";
    import Tabs from 'stwui/tabs';

    import Drawer from './components/Drawer.svelte';
    import IconButton from './components/IconButton.svelte';
    import type { ColumnSettings_v1 } from './widgets/column/ColumnSettings';
    import { dndzone } from 'svelte-dnd-action';
    import { mdiDelete } from './components/icons';

    export let open: boolean = false;
    export let item: GridItem_v1 | undefined;

    const dispatch = createEventDispatcher();

    let copy: GridItem_v1 | undefined;

    let mode: 'card'|'view' = 'card';
    let context: WidgetContext = { mode: 'card', editing: true, select: selectWidget, update: updateWidget };

    $: onOpen(open);
    $: onMode(mode);
    $: onItem(item);
    $: onSelected(selected);

    let settings: WidgetSettings[];
    let selected: WidgetSettings | undefined;

    function onOpen(_open: boolean) {
        if(_open) {
            mode = 'card';
        }
    }

    function onMode(_mode: string) {
        selected = undefined;
    }

    function onItem(_item: GridItem_v1 | undefined) {
        if(_item === undefined) {
            return;
        }

        copy = JSON.parse(JSON.stringify(_item));

        settings = mode === 'card' ? copy!.card : copy!.view;
        context = { mode, editing: true, select: selectWidget, update: updateWidget };

        if(settings.length > 0) {
            selected = settings[0];
        }
    }

    function onSelected(_selected: WidgetSettings | undefined) {
        if(_selected !== undefined) {
            context = { ...context }; // Force refresh
        }
    }

    function selectWidget(id: string) {
        selected = settings?.find(w => w.id === id);
    }

    function updateWidget(_settings: WidgetSettings) {
        if(settings !== undefined) {
            const index = settings.findIndex(s => s.id === _settings.id);
            const settingsCopy = [...settings];
            settingsCopy[index] = _settings;
            settings = settingsCopy;

            if(mode === 'card') {
                copy!.card = settings;
            } else {
                copy!.view = settings;
            }

            if(selected !== undefined && selected.id === _settings.id) {
                selected = _settings;
            }
        }
    }

    function handleSort(e: any) {
        settings = e.detail.items;
            
        if(mode === 'card') {
            copy!.card = settings;
        } else {
            copy!.view = settings;
        }
    }

    function addWidget(type: string) : void {
        if(type === undefined || copy === undefined) {
          return;
        }

        const create = findCreate(type);

        if(create !== undefined) {
            const widget = create();

            settings = [...settings!, widget];
            
            if(mode === 'card') {
                copy.card = settings;
            } else {
                copy.view = settings;
            }

            context = { ...context };
        }
    }

    function removeWidget(id: string) {
        if(copy !== undefined && selected !== undefined) {

            settings = settings!.filter(w => w.id !== id);

            if(mode === 'card') {
                copy.card = settings;
            } else {
                copy.view = settings;
            }

            context = { ...context };
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
        dispatch('item', { ...copy });
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
                {#each widgetTypes as widget}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="flex items-center cursor-pointer" on:click={() => addWidget(widget.type)}>
                        <IconButton data={widget.icon} />
                        <span>{widget.label}</span>
                    </div>
                {/each}
            </div>

            <Tabs currentTab={mode} variant="full-width">
                <Tabs.Tab key="card" href="#card" on:click={() => (mode = 'card')}>Card</Tabs.Tab>
                <Tabs.Tab key="view" href="#view" on:click={() => (mode = 'view')}>View</Tabs.Tab>
             </Tabs>

            <Divider>
                <Divider.Label slot="label">Preview</Divider.Label>
            </Divider>

            <div use:dndzone={{ items: settings, flipDurationMs: 200 }} on:consider={handleSort} on:finalize={handleSort} class="w-full">
                {#each settings as s(s.id)}
                    {#if s?.type !== undefined}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="w-full flex justify-between" on:click={e => context.select(s.id)} class:border-2={selected === s}>
                            <svelte:component 
                                this={findWidget(s.type)}
                                settings={s}
                                context={context}
                            />

                            <div class="flex items-center">
                                <IconButton data={mdiDelete} on:click={() => removeWidget(s.id)} />
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>

            <Divider>
                <Divider.Label slot="label">Settings</Divider.Label>
            </Divider>

            {#if selected}
                <div class="mt-5">
                    <svelte:component 
                        this={findEditor(selected.type)}
                        settings={selected}
                        on:settings={e => updateWidget(e.detail)}
                    />
                </div>
            {/if}
        {/if}
    </Drawer>
{/if}