<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { ForeachSettings_v1 } from './ForeachSettings';
    
    import Widget from '$lib/widgets/Widget.svelte';
    import { devices, zones } from '$lib/stores/homey';
    import DndSingle from '$lib/components/DndSingle.svelte';
    import { generateItems, transform } from './foreachUtils';
    
    export let context: WidgetContext;
    export let settings: ForeachSettings_v1;

    const dispatch = createEventDispatcher();

    let items: any[];
    let child: WidgetSettings_v1 | undefined;
    let renderSettings: WidgetSettings_v1[];
    let renderContext: WidgetContext;

    $: onSettings(settings);
    $: items = generateItems($devices, $zones, settings);
    $: renderSettings = onChildItems(child, items);
    $: renderContext = { ...context, editable: false };

    function onSettings(_settings: ForeachSettings_v1) {
        child = _settings.item;
    }

    function onItem(_item: WidgetSettings_v1) {
        child = { ..._item };
        settings = { ...settings, item: child };

        dispatch('settings', settings);
    }

    function updateWidget(_item: WidgetSettings_v1) {
        child = { ..._item };
        settings = { ...settings, item: child };

        dispatch('settings', settings);
    }

    function onChildItems(_child: WidgetSettings_v1 | undefined, _items: any[]) {
        return _items.map(item => transform(_child, item, settings.slug!)) as WidgetSettings_v1[]
    }
</script>

{#if context.editable}
    <DndSingle 
        item={child}
        on:item={e => onItem(e.detail)} 
        editable={context.editable}
        class="w-full {context.editable ? 'min-h-[50px]' : ''}"
        let:item
    >
        <Widget {context} settings={item} on:settings={e => updateWidget(e.detail)} />
    </DndSingle>
{:else}
    {#each renderSettings as s}
        <Widget context={renderContext} settings={s} />
    {/each}
{/if}