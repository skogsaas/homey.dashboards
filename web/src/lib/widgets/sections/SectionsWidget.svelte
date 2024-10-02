<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { SectionsSettings_v1 } from './SectionsSettings';
    import SectionInfo from '../section';
    
    import Icon from '$lib/components/Icon.svelte';
    import { mdiPlus } from '$lib/components/icons';

    import Widget from '../Widget.svelte';
    import DndList from '$lib/components/DndList.svelte';
    import { createEventDispatcher } from 'svelte';
    
    export let context: WidgetContext;
    export let settings: SectionsSettings_v1;

    const dispatch = createEventDispatcher();

    let items: WidgetSettings_v1[];
    $: onSettings(settings);

    function onSettings(_settings: SectionsSettings_v1) {
        items = settings.items ?? [];
    }

    function onItems(_items: WidgetSettings_v1[]) {
        items = [..._items];
        settings = { ...settings, items };

        dispatch('settings', settings);
    }

    function updateSection(_section: WidgetSettings_v1) {
        const index = items.findIndex(s => s.id === _section.id);
        items[index] = { ..._section };

        items = [...items];
        settings = { ...settings, items };

        dispatch('settings', settings);
    }

    function addSection() {
        const section = SectionInfo.create();

        items = [...items, section];
        settings = { ...settings, items };

        dispatch('settings', settings);
    }
</script>

{#if context.editable}
    <div class="flex align-middle justify-center w-full py-2">
        <button class="btn btn-circle" on:click|stopPropagation={e => addSection()}>
            <Icon data={mdiPlus} />
        </button>
        <div>Add section</div>
    </div>
{/if}

<DndList 
    items={items}
    on:items={e => onItems(e.detail)} 
    editable={context.editable}
    class="w-full grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 {context.editable ? 'min-h-[50px]' : ''}" 
    let:item
>
    <Widget {context} settings={item} on:settings={e => updateSection(e.detail)} />
</DndList>