<script lang="ts">
    import type { ListSettings_v1 } from './ListSettings';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import WidgetList from '$lib/components/WidgetList.svelte';
    
    export let settings: ListSettings_v1;
    export let context: WidgetContext;

    let items: WidgetSettings_v1[];

    $: onSettings(settings);

    function onSettings(_settings: ListSettings_v1) {
        items = settings.items ?? [];
    }

    function updateItems(_items: WidgetSettings_v1[]) {
        items = [..._items];
        settings = { ...settings, items };

        context.update(settings);
    }
</script>

<WidgetList 
    id={settings.id}
    {context} 
    {items} 
    {updateItems}
    class="w-full flex flex-col {settings.gap ?? 'gap-0'}"
/>