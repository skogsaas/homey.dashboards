<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { ForeachSettings_v1 } from './ForeachSettings';
    
    import Widget from '$lib/widgets/Widget.svelte';
    import { devices, zones } from '$lib/stores/homey';
    import { generateItems } from './foreachUtils';
    import { transform } from '../template/templateUtils';
    import WidgetSingle from '$lib/components/WidgetSingle.svelte';
    import { selection } from '$lib/stores/editing';
    
    export let context: WidgetContext;
    export let settings: ForeachSettings_v1;

    let items: any[];
    let child: WidgetSettings_v1 | undefined;
    let childSettings: WidgetSettings_v1[];

    $: onSettings(settings);
    $: selected = settings.id === $selection;
    $: items = generateItems($devices, $zones, settings);
    $: childSettings = onChildItems(child, items);
    $: childContext = { ...context, editable: false, readonly: true }

    function onSettings(_settings: ForeachSettings_v1) {
        child = _settings.item;
    }

    function onChildItems(_child: WidgetSettings_v1 | undefined, _items: any[]) {
        return _items.map(item => transform(_child, item, settings.slug!)) as WidgetSettings_v1[]
    }

    function updateItem(_item: WidgetSettings_v1 | undefined) {
        child = _item;
        settings = { ...settings, item: child };

        context.update(settings);
    }
</script>

{#if context.editable}
    <WidgetSingle
        id={settings.id}
        {context} 
        item={child} 
        {updateItem}
        class="w-full {settings.gap ?? 'gap-0'}"
    />
{:else}
    <div class="flex flex-col {settings.gap ?? 'gap-0'}">
        {#each childSettings as s}
            <Widget context={context} settings={s} />
        {/each}
    </div>
{/if}