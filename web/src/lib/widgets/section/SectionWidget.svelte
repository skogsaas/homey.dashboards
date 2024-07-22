<script lang="ts">
    import type { SectionSettings_v1 } from './SectionSettings';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    import Widget from '$lib/widgets/Widget.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import DndList from '$lib/components/DndList.svelte';
    import { createEventDispatcher } from 'svelte';
    
    export let settings: SectionSettings_v1;
    export let context: WidgetContext;

    const dispatch = createEventDispatcher();

    let items: WidgetSettings_v1[];

    $: onSettings(settings);

    function onSettings(_settings: SectionSettings_v1) {
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

<section class="card bg-base-200 shadow-md w-full">
    <div class="card-body">
        <h1 class="card-title">
            {#if settings.iconId !== undefined}
                <Icon data={getIcon(settings.iconId)} />
            {/if}
            {settings.title ?? 'New section'}
        </h1>

        {#if settings.items === undefined || settings.items.length === 0}
            <p>Empty...</p>
        {/if}

        <DndList 
            items={settings.items} 
            on:items={e => onItems(e.detail)}
            editable={context.editable}
            class="w-full min-h-[50px]" 
            let:item
        >
            <Widget {context} settings={item} on:settings={e => updateWidget(e.detail)} />
        </DndList>
    </div>
</section>