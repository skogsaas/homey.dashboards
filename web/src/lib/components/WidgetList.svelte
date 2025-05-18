<script lang="ts">
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndList from '$lib/components/DndList.svelte';
    import { copying, selection } from '$lib/stores/editing';
    import { clone } from '$lib/widgets/widgetUtils';
    import Icon from './Icon.svelte';
    import { mdiClose, mdiContentPaste, mdiPlus } from './icons';
    import WidgetTypePicker from './WidgetTypePicker.svelte';
    import { findCreate } from '$lib/widgets';
    import WidgetTypeList from './WidgetTypeList.svelte';
    
    export let id: string;
    export let items: WidgetSettings_v1[];
    export let updateItems: (items: WidgetSettings_v1[]) => void;
    export let context: WidgetContext;

    let classes = '';
	export { classes as class };

    $: selected = id === $selection;
    $: childContext = { ...context, update: updateChild, remove: removeChild };
    $: extraClasses = context.editable && items.length === 0 ? 'min-h-8' : ''

    let modal: HTMLDialogElement;

    function onItemList(_items: WidgetSettings_v1[]) {
        items = [..._items];

        updateItems(items);
    }

    function updateChild(_item: WidgetSettings_v1) {
        const index = items.findIndex(s => s.id === _item.id);
        items[index] = { ..._item };
        items = [...items];

        updateItems(items);
    }

    function insertChild(_item: WidgetSettings_v1) {
        items = [...items, _item];

        updateItems(items);
    }

    function removeChild(id: string) {
        items = items.filter(s => s.id !== id);

        updateItems(items);
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

<DndList 
    items={items} 
    on:items={e => onItemList(e.detail)}
    editable={context.editable}
    class={classes + ' ' + extraClasses} 
    let:item
>
    <Widget context={childContext} settings={item} />
</DndList>

{#if context.editable && selected}
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
{/if}

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