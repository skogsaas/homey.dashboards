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
    
    let sm: string;
    let smGap: string;

    let md: string;
    let mdGap: string;

    let lg: string;
    let lgGap: string;

    let xl: string;
    let xlGap: string;

    let xxl: string;
    let xxlGap: string;

    $: onSettings(settings);

    function onSettings(_settings: SectionsSettings_v1) {
        items = settings.items ?? [];

        sm = settings.sm ?? 'grid-cols-1';
        md = settings.md ?? 'grid-cols-2';
        lg = settings.lg ?? 'grid-cols-3';
        xl = settings.xl ?? 'grid-cols-4';
        xxl = settings.xxl ?? 'grid-cols-5';

        smGap = settings.smGap ?? 'gap-2';
        mdGap = settings.mdGap ?? 'gap-2';
        lgGap = settings.lgGap ?? 'gap-2';
        xlGap = settings.xlGap ?? 'gap-2';
        xxlGap = settings.xxlGap ?? 'gap-2';
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
    class="w-full grid gap-1 sm:{smGap} md:{mdGap} lg:{lgGap} xl:{xlGap} 2xl:{xxlGap} grid-cols-1 sm:{sm} md:{md} lg:{lg} xl:{xl} 2xl:{xxl} {context.editable ? 'min-h-[50px]' : ''}" 
    let:item
>
    <Widget {context} settings={item} on:settings={e => updateSection(e.detail)} />
</DndList>