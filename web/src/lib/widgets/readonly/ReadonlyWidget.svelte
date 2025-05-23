<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { ReadonlySettings_v1 } from './ReadonlySettings';
    import WidgetSingle from '$lib/components/WidgetSingle.svelte';
    
    export let settings: ReadonlySettings_v1;
    export let context: WidgetContext;

    let item: WidgetSettings_v1 | undefined;

    $: onSettings(settings);
    $: childContext = { ...context, readonly: true };

    function onSettings(_settings: ReadonlySettings_v1) {
        item = _settings.item;
    }

    function updateItem(_item: WidgetSettings_v1 | undefined) {
        settings = { ...settings, item: _item };

        context.update(settings);
    }
</script>

<WidgetSingle
    id={settings.id}
    context={childContext}
    {item} 
    {updateItem}
/>