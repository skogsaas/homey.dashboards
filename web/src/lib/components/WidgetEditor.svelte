<script lang="ts">
    import type { WidgetBreadcrumb, WidgetContext, WidgetSettings_v1 } from "$lib/types/Widgets";
    import { createEventDispatcher } from "svelte";
    import Icon from "./Icon.svelte";
    import { mdiFloppy, mdiMagnify, mdiMenu, mdiPencil, mdiTrashCan, mdiWidgets } from "./icons";
    import { findEditor, findInfo, findLabel } from "$lib/widgets";
    import Widget from "$lib/widgets/Widget.svelte";
    import WidgetTypeList from "./WidgetTypeList.svelte";
    import DndSingle from "./DndSingle.svelte";
    import DndTrash from "./DndTrash.svelte";

    const dispatch = createEventDispatcher();

    export let title: string;
    export let root: WidgetSettings_v1 | undefined;

    export let saveTitle: string = 'Save';
    
    export let settingsIcon: string;
    export let settingsTitle: string;

    let preview: boolean = false;

    let drawerOpen: boolean = false;
    let drawerContent: string = 'settings';
    
    let breadcrumbs: WidgetBreadcrumb[] = [];
    let breadcrumb: WidgetBreadcrumb | undefined;

    let context: WidgetContext;
    $: context = { 
        editable: !preview, 
        readonly: true, 
        breadcrumbs: [],
        select: onBreadrumbs
    };

    function save() {
        dispatch('save');
    }

    function select(_breadcrumb: WidgetBreadcrumb | undefined) {
        breadcrumb = _breadcrumb;

        drawerContent = 'settings';
        drawerOpen = true;
    }

    function onPreview(_preview: boolean) {
        preview = _preview;
    }

    function onBreadrumbs(_breadcrumbs: WidgetBreadcrumb[]) {
        breadcrumbs = _breadcrumbs;

        if(breadcrumbs.length > 0) {
            breadcrumb = breadcrumbs[breadcrumbs.length - 1];
        } else {
            breadcrumb = undefined;
        }

        drawerContent = 'settings';
        drawerOpen = true;
    }

    function onDragging(dragging: boolean) {
        if(dragging) {
            drawerOpen = false;
        }
    }

    function onRoot(_root: WidgetSettings_v1 | undefined) {
        root = _root;
        dispatch('root', root);
    }

    function updateWidget(updated: WidgetSettings_v1) {
        breadcrumb!.update(updated);
    }
</script>

<div class="drawer">
    <input id="toolbar-drawer" type="checkbox" class="drawer-toggle" bind:checked={drawerOpen} />

    <div class="drawer-content">
        <div class="navbar bg-base-200 flex-none">
            <div class="navbar-start">
                <label for="main-drawer" aria-label="close sidebar" class="btn btn-square btn-ghost">
                    <Icon data={mdiMenu} />
                </label>

                <div class="hidden md:block">
                    <button class="btn btn-ghost text-xl">{title ?? ''}</button>
                </div>
            </div>

            {#if !preview}
                <div class="navbar-center gap-2">
                    <button class="btn btn-square btn-ghost" on:click={() => { drawerContent = 'widgets'; drawerOpen = !drawerOpen; }} >
                        <Icon data={mdiWidgets} />
                        Widgets
                    </button>

                    <DndTrash class="btn btn-square btn-ghost">
                        <Icon data={mdiTrashCan} />
                        Trash
                    </DndTrash>
                </div>
            {/if}

            <div class="navbar-end">
                <div class="join mr-2">
                    <button class="btn join-item" class:btn-secondary={preview} on:click={() => onPreview(true)}>
                        <Icon data={mdiMagnify} />    
                    </button>
                    <button class="btn join-item" class:btn-secondary={!preview} on:click={() => onPreview(false)}>
                        <Icon data={mdiPencil} />
                    </button>
                </div>

                <button class="btn btn-square btn-primary" on:click={() => save()} >
                    <Icon data={mdiFloppy} />
                    {saveTitle}
                </button>
            </div>
        </div>

        {#if !preview}
            <div class="w-full text-sm breadcrumbs bg-base-200 px-2">
                <ul>
                    <li></li>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <li>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <a on:click={() => select(undefined)}>
                            <Icon data={settingsIcon} />
                            {settingsTitle}
                        </a>
                    </li>

                    {#each breadcrumbs as b}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <li>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a on:click={() => select(b)}>
                                <Icon data={findInfo(b.settings.type)?.icon} />
                                {findLabel(b.settings.type)}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="flex flex-row justify-center p-2" on:click={() => onBreadrumbs([])}>
            <div class="w-full">
                <DndSingle editable={context.editable} item={root} on:item={e => onRoot(e.detail)} let:item>
                    <Widget settings={item} {context} on:settings={e => onRoot(e.detail)} />
                </DndSingle>
            </div>
        </div>
    </div>

    <div class="drawer-side z-[1000]">
        <label for="toolbar-drawer" aria-label="close sidebar" class="drawer-overlay"></label>

        <div class="w-full max-w-xs min-h-full bg-base-200 p-2">
            {#if drawerContent === 'widgets'}
                <WidgetTypeList on:dragging={e => onDragging(e.detail)} />
            {:else if drawerContent === 'settings'}
                {#if breadcrumb !== undefined}
                    <div class="text-lg text-center">{findLabel(breadcrumb.settings.type)} settings</div>
            
                    <svelte:component 
                        this={findEditor(breadcrumb.settings.type)}
                        settings={breadcrumb.settings}
                        on:settings={e => updateWidget(e.detail)}
                    />
                {:else}
                    <div class="text-lg text-center">{settingsTitle} settings</div>
                    <slot></slot>
                {/if}
            {/if}
        </div>
    </div>
</div>