<script lang="ts">
    import type { DialogSettings_v1 } from './DialogSettings';
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndSingle from '$lib/components/DndSingle.svelte';
    import WidgetSingle from '$lib/components/WidgetSingle.svelte';
        
    export let settings: DialogSettings_v1;
    export let context: WidgetContext; 

    let modal: HTMLDialogElement;

    let summary: WidgetSettings_v1 | undefined;
    let details: WidgetSettings_v1 | undefined;

    $: selected = context.selected === settings.id;
    $: summaryContext = { ...context, update: updateSummary, insert: summary === undefined ? updateSummary : undefined, remove: removeSummary };
    $: detailsContext = { ...context, update: updateDetails, insert: details === undefined ? updateDetails : undefined, remove: removeDetails };
    $: onSettings(settings);

    function onSettings(_settings: DialogSettings_v1) {
        summary = _settings.summary;
        details = _settings.details;
    }

    function updateSummary(_item: WidgetSettings_v1 | undefined) {
        summary = _item ? { ..._item } : undefined;
        settings = { ...settings, summary };

        context.update(settings);
    }

    function updateDetails(_item: WidgetSettings_v1 | undefined) {
        details = _item ? { ..._item } : undefined;
        settings = { ...settings, details };

        context.update(settings);
    }

    function removeSummary(id: string) {
        if(summary?.id === id) {
            updateSummary(undefined);
        }
    }

    function removeDetails(id: string) {
        if(details?.id === id) {
            updateDetails(undefined);
        }
    }
</script>

{#if context.editable}
    {#if selected}
        <button class="btn btn-circle btn-sm" on:click|stopPropagation={e => modal.show()}>Open</button>
    {/if}

    <WidgetSingle
        id={settings.id}
        {context}
        item={summary}
        updateItem={updateSummary}
        class="w-full {context.editable && summary === undefined ? 'min-w-[100px]' : ''} {summary === undefined ? 'border border-dashed' : ''}"
    />
{:else if summary !== undefined}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation|preventDefault={e => modal.show()}>
        <Widget context={summaryContext} settings={summary} />
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
            <WidgetSingle
                id={settings.id}
                {context}
                item={details}
                updateItem={updateDetails}
                class="w-full {details === undefined ? 'border border-dashed' : ''}"
            />

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
                <Widget context={detailsContext} settings={details} />
            {/if}
        </div>

        <form method="dialog" class="modal-backdrop bg-base-300/90">
            <button>close</button>
        </form>
    </dialog>
{/if}