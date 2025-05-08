<script lang="ts">
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndSingle from './DndSingle.svelte';
    import { copying, selection } from '$lib/stores/editing';
    import { clone } from '$lib/widgets/widgetUtils';
    import Icon from './Icon.svelte';
    import { mdiPlus } from './icons';
    
    export let id: string;
    export let item: WidgetSettings_v1 | undefined;
    export let updateItem: (item: WidgetSettings_v1 | undefined) => void;
    export let context: WidgetContext;

    let classes = '';
	export { classes as class };

    $: selected = id === $selection;
    $: childContext = { ...context, update: updateChild, remove: removeChild };
    $: extraClasses = context.editable && selected ? 'min-h-8' : 'min-h-8'

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

{#if item === undefined && context.editable && selected && $copying !== undefined}
    <div class="flex flex-col items-center justify-center w-full h-full p-2border-2 border-dashed rounded-lg">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click={e => onPaste()}>
            <Icon data={mdiPlus} />
        </a>
    </div>
{/if}