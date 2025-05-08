<script lang="ts">
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndList from '$lib/components/DndList.svelte';
    import { copying, selection } from '$lib/stores/editing';
    import { clone } from '$lib/widgets/widgetUtils';
    import Icon from './Icon.svelte';
    import { mdiPlus } from './icons';
    
    export let id: string;
    export let items: WidgetSettings_v1[];
    export let updateItems: (items: WidgetSettings_v1[]) => void;
    export let context: WidgetContext;

    let classes = '';
	export { classes as class };

    $: selected = id === $selection;
    $: childContext = { ...context, update: updateChild, remove: removeChild };
    $: extraClasses = context.editable && items.length === 0 ? 'min-h-8' : ''

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

{#if context.editable && $copying !== undefined}
    <div class="flex flex-col items-center justify-center w-full h-full p-2border-2 border-dashed rounded-lg">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click={e => onPaste()}>
            <Icon data={mdiPlus} extraClass="stroke-secondary" />
        </a>
        <span class="text-[10px]">Add</span>
    </div>
{/if}