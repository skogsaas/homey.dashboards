<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { CardSettings_v1 } from './CardSettings';
    import Widget from '../Widget.svelte';
    import DndList from '$lib/components/DndList.svelte';
    
    export let context: WidgetContext;
    export let settings: CardSettings_v1;

    const dispatch = createEventDispatcher();

    let items: WidgetSettings_v1[];
    $: onSettings(settings);

    function onSettings(_settings: CardSettings_v1) {
        items = settings.items ?? [];
    }

    function onItems(_items: WidgetSettings_v1[]) {
        items = [..._items];
        settings = { ...settings, items };

        dispatch('settings', settings);
    }

    function updateWidget(_section: WidgetSettings_v1) {
        const index = items.findIndex(s => s.id === _section.id);
        items[index] = { ..._section };

        items = [...items];
        settings = { ...settings, items };

        dispatch('settings', settings);
    }
</script>

<div class="card bg-base-200 shadow-md overflow-hidden w-full h-full">
    <DndList 
        items={items}
        on:items={e => onItems(e.detail)} 
        editable={context.editable}
        class="card-body w-full h-full min-h-[50px] {settings.padding ?? ''}"
        let:item
    >
        <Widget {context} settings={item} on:settings={e => updateWidget(e.detail)} />
    </DndList>
</div>