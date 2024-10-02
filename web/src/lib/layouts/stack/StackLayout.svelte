<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { StackSettings_v1 } from './StackLayout';
    
    import Widget from '$lib/widgets/Widget.svelte';
    
    export let context: WidgetContext;
    export let settings: StackSettings_v1;

    const dispatch = createEventDispatcher();

    let items: WidgetSettings_v1[];
    let cardContext: WidgetContext;

    $: items = settings?.items ?? [];
    $: breadcrumbs = [...context.breadcrumbs, { settings, update }];
    $: childContext = { ...context, breadcrumbs }

    function update(_settings: WidgetSettings_v1) {
        // No editable settings for now
        // TODO: Add settings for gap and maybe each item as a seperate card
    }

    function updateWidget(widget: WidgetSettings_v1, index: number) {
        const copy = { ...settings, items: [...settings.items ?? []] };
        copy.items[index] = widget;

        settings = copy;
        dispatch('settings', settings);
    }
</script>

<div class="flex flex-col w-full">
    {#each items as item, index}
        <div class="w-full">
            <Widget context={childContext} settings={item} on:settings={e => updateWidget(e.detail, index)} />
        </div>
    {/each}
</div>