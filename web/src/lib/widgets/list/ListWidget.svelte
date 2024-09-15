<script lang="ts">
    import type { StackSettings_v1 } from './ListSettings';
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndList from '$lib/components/DndList.svelte';
    import { createEventDispatcher } from 'svelte';
    
    export let settings: StackSettings_v1;
    export let context: WidgetContext;

    const dispatch = createEventDispatcher();

    let items: WidgetSettings_v1[];

    $: onSettings(settings);

    function onSettings(_settings: StackSettings_v1) {
        items = settings.items ?? [];
    }

    function onItems(_items: WidgetSettings_v1[]) {
        items = [..._items];
        settings = { ...settings, items };

        dispatch('settings', settings);
    }

    function updateWidget(_widget: WidgetSettings_v1) {
        const index = items.findIndex(s => s.id === _widget.id);
        items[index] = { ..._widget };

        items = [...items];
        settings = { ...settings, items };

        dispatch('settings', settings);
    }
</script>

<DndList 
    items={settings.items} 
    on:items={e => onItems(e.detail)}
    editable={context.editable}
    class="w-full {context.editable ? 'min-h-[50px]' : ''}" 
    let:item
>
    <Widget {context} settings={item} on:settings={e => updateWidget(e.detail)} />
</DndList>