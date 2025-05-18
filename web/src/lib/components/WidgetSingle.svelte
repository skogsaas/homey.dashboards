<script lang="ts">
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndSingle from './DndSingle.svelte';
    import { copying, selection } from '$lib/stores/editing';
    import { clone } from '$lib/widgets/widgetUtils';
    import Icon from './Icon.svelte';
    import { mdiClose, mdiContentPaste, mdiPlus } from './icons';
    import WidgetTypeList from './WidgetTypeList.svelte';
    import { findCreate } from '$lib/widgets';
    
    export let id: string;
    export let item: WidgetSettings_v1 | undefined;
    export let updateItem: (item: WidgetSettings_v1 | undefined) => void;
    export let context: WidgetContext;

    let classes = '';
	export { classes as class };

    $: selected = id === $selection;
    $: childContext = { ...context, update: updateChild, remove: removeChild };
    $: extraClasses = context.editable && selected ? 'min-h-8' : 'min-h-8'

    let modal: HTMLDialogElement;

    function onItemSingle(_item: WidgetSettings_v1) {
        item = _item;
        updateItem(_item);
    }

    function updateChild(_item: WidgetSettings_v1) {
        item = _item;
        updateItem(item);
    }

    function insertChild(_item: WidgetSettings_v1) {
        item = _item;
        updateItem(item);
    }

    function removeChild(id: string) {
        if(item?.id === id) {
            item = undefined;
            updateItem(undefined);
        }
    }

    function onPaste() {
        if($copying.operation === 'cut' && $copying.source?.remove !== undefined) {
            $copying.source.remove($copying.settings.id);
        }

        let item = $copying.settings;

        if($copying.operation === 'copy') {
            // Make a deep copy with updated ids.
            item = clone($copying.settings);
        }

        insertChild(item);
    }

    function onAdd(type: string) {
        const item = findCreate(type)!();
        insertChild(item);

        modal.close();
    }
</script>

<DndSingle 
    item={item} 
    on:item={e => onItemSingle(e.detail)}
    editable={context.editable}
    class={classes + ' ' + extraClasses} 
    let:item
>
    <Widget context={childContext} settings={item} />
</DndSingle>

{#if item === undefined && context.editable && selected}
    <div class="join flex flex-row justify-center w-full mt-2">
        {#if $copying !== undefined}
            <button class="btn btn-outline btn-ghost btn-sm join-item" on:click={onPaste}>
                <Icon data={mdiContentPaste} />
                <span class="text-xs">Paste</span>
            </button>
        {/if}

        <button class="btn btn-outline btn-ghost btn-sm join-item" on:click={() => modal.showModal()}>
            <Icon data={mdiPlus} />
            <span class="text-xs">Add</span>
        </button>
    </div>

    <dialog bind:this={modal} class="modal">
        <div class="modal-box flex flex-col">
            <div class="flex-shrink-0 mb-2">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                        <Icon data={mdiClose} />
                    </button>
                </form>
            </div>
            
            <div class="flex-grow overflow-auto">
                <WidgetTypeList on:click={e => onAdd(e.detail)} mode="click" />
            </div>
        </div>
    </dialog>
{/if}