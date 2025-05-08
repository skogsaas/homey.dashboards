<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { CardSettings_v1 } from './CardSettings';
    import WidgetList from '$lib/components/WidgetList.svelte';
    
    export let context: WidgetContext;
    export let settings: CardSettings_v1;

    let items: WidgetSettings_v1[];
    
    $: onSettings(settings);

    function onSettings(_settings: CardSettings_v1) {
        items = settings.items ?? [];
    }

    function updateItems(_items: WidgetSettings_v1[]) {
        items = [..._items];
        settings = { ...settings, items };

        context.update(settings);
    }
</script>

<div class="card bg-base-200 shadow-md overflow-hidden w-full h-full">
    <WidgetList
        id={settings.id}
        {context} 
        {items} 
        {updateItems}
        class="card-body w-full h-full {settings.padding ?? ''}"
    />
</div>