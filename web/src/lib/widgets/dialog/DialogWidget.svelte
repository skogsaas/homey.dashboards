<script lang="ts">
    import type { DialogSettings_v1, ListSettings_v1 } from './DialogSettings';
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndList from '$lib/components/DndList.svelte';
    import { createEventDispatcher } from 'svelte';
    import DndSingle from '$lib/components/DndSingle.svelte';
    import { editing } from '$lib/stores/editing';
    
    export let settings: ListSettings_v1;
    export let context: WidgetContext; 

    const dispatch = createEventDispatcher();

    let modal: HTMLDialogElement;

    let summary: WidgetSettings_v1 | undefined;
    let details: WidgetSettings_v1 | undefined;

    $: onSettings(settings);

    function onSettings(_settings: DialogSettings_v1) {
        summary = _settings.summary;
        details = _settings.details;

        console.log(_settings);
    }

    function onSummaryItem(_item: WidgetSettings_v1) {
        summary = { ..._item };
        settings = { ...settings, summary };

        console.log('summary', settings);

        dispatch('settings', settings);
    }

    function onDetailsItem(_item: WidgetSettings_v1) {
        details = { ..._item };
        settings = { ...settings, details };

        console.log('details', settings);

        dispatch('settings', settings);
    }
</script>

{#if context.editable}
    <button class="btn btn-circle btn-sm" on:click|stopPropagation={e => modal.show()}>Open</button>

    <DndSingle
        item={summary}
        on:item={e => onSummaryItem(e.detail)} 
        editable={context.editable}
        class="w-full {context.editable ? 'min-h-[50px] min-w-[100px]' : ''}"
        let:item
    >
        <Widget {context} settings={item} on:settings={e => onSummaryItem(e.detail)} />
    </DndSingle>
{:else if summary !== undefined}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation|preventDefault={e => modal.show()}>
        <Widget {context} settings={summary} />
    </div>
{/if}

{#if context.editable}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <dialog 
        bind:this={modal} 
        class="fixed top-0 w-full h-full z-10 bg-transparent place-items-center content-center pointer-events-none" 
        on:click|stopPropagation={e => {}}
    >
        <div class="modal-box flex flex-col pointer-events-auto">
            <DndSingle 
                item={details}
                on:item={e => onDetailsItem(e.detail)} 
                editable={context.editable}
                class="w-full {context.editable ? 'min-h-[50px]' : ''}"
                let:item
            >
                <Widget {context} settings={item} on:settings={e => onDetailsItem(e.detail)} />
            </DndSingle>

            <div class="modal-action">
                <form method="dialog">
                    <button class="btn">Close</button>
                </form>
            </div>
        </div>
    </dialog>
{:else}
    <dialog bind:this={modal} class="modal modal-bottom sm:modal-middle">
        <div class="modal-box flex flex-col">
            {#if details !== undefined}
                <Widget {context} settings={details} />
            {/if}
        </div>

        <form method="dialog" class="modal-backdrop bg-base-300/90">
            <button>close</button>
        </form>
    </dialog>
{/if}