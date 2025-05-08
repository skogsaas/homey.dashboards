<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { SectionsSettings_v1 } from './SectionsSettings';

    import WidgetList from '$lib/components/WidgetList.svelte';
    
    export let context: WidgetContext;
    export let settings: SectionsSettings_v1;

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
    class="w-full grid gap-1 sm:{smGap} md:{mdGap} lg:{lgGap} xl:{xlGap} 2xl:{xxlGap} grid-cols-1 sm:{sm} md:{md} lg:{lg} xl:{xl} 2xl:{xxl}" 
/>