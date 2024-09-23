<script lang="ts">
    import { categories, findInfo, widgets } from "$lib/widgets";
    import TemplateInfo from '$lib/widgets/template';
    import type { TemplateSettings_v1 } from '$lib/widgets/template/TemplateSettings';

    import Icon from '$lib/components/Icon.svelte'
    import {dndzone} from "svelte-dnd-action";
    import { mdiHelp, mdiPlay } from "$lib/components/icons";
    import type { WidgetSettings_v1 } from "$lib/types/Widgets";

    import { templates } from '$lib/stores/homey';
    import type { TemplateMap } from "$lib/types/Store";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    const flipDurationMs = 300;    

    let widgetItems: WidgetSettings_v1[][] = getWidgets();
    let templateItems: TemplateSettings_v1[] = getTemplates($templates);

    function getWidgets() : WidgetSettings_v1[][] {
        return categories
            .map(c => widgets
                .filter(w => w.category === c.id && w.type !== TemplateInfo.type)
                .map(w => w.create())
            );
    }

    function getTemplates(_templates: TemplateMap) : TemplateSettings_v1[] {
        let result: TemplateSettings_v1[];

        result = Object.values(_templates)
            .map(template => {
                const settings: TemplateSettings_v1 = TemplateInfo.create() as TemplateSettings_v1;
                settings.templateId = template.id;

                return settings;
            });

        return result;
    }

    function getWidgetIcon(type: string) : string {
        const info = findInfo(type);

        return info?.icon ?? mdiHelp;
    }

    function getWidgetLabel(type: string) : string {
        const info = findInfo(type);

        return info?.label ?? 'Unkown';
    }

    function getTemplateLabel(templateId: string) : string {
        const info = $templates[templateId];

        return info?.title ?? 'Unkown';
    }

    function considerDndWidgets(_category: number, _items: any[], trigger: string) {
        handleDndWidgets(_category, _items, trigger, false);
    }

    function finalizeDndWidgets(_category: number, _items: any[], trigger: string) {
        handleDndWidgets(_category, _items, trigger, true);
    }

    function handleDndWidgets(_category: number, _items: any[], trigger: string, finalize: boolean) {
        // Figure out which item is being removed. After that, recreate it and add it to the items list.
        const index = widgetItems[_category].findIndex(i => !_items.some(w => w.id === i.id));

        if(index > -1) {
            const item = widgetItems[_category][index];
            widgetItems[_category][index] = findInfo((item as WidgetSettings_v1).type)!.create();

            widgetItems = [...widgetItems];
        }

        if(trigger === 'dragStarted') {
            dispatch('dragging', true);
        } else if (finalize) {
            dispatch('dragging', false);
        }
    }

    function considerDndTemplates(_items: any[], trigger: string) {
        handleDndTemplates(_items, trigger, false);
    }

    function finalizeDndTemplates(_items: any[], trigger: string) {
        handleDndTemplates(_items, trigger, true);
    }

    function handleDndTemplates(_items: any[], trigger: string, finalize: boolean) {
        // Figure out which item is being removed. After that, recreate it and add it to the items list.
        const index = templateItems.findIndex(i => !_items.some(w => w.id === i.id));

        if(index > -1) {
            const item = templateItems[index];

            const settings: TemplateSettings_v1 = TemplateInfo.create() as TemplateSettings_v1;
            settings.templateId = (item as TemplateSettings_v1).templateId;
            templateItems[index] = settings;

            templateItems = [...templateItems];
        }

        if(trigger === 'dragStarted') {
            dispatch('dragging', true);
        } else if (finalize) {
            dispatch('dragging', false);
        }
    }
</script>

<div class="w-full h-full">
    <h2 class="text-xl">Templates</h2>

    {#if templateItems.length > 0}
        <div
            class="w-full p-2"
            use:dndzone={{ items: templateItems, flipDurationMs, centreDraggedOnCursor: true, dropFromOthersDisabled: true}}
            on:consider={e => considerDndTemplates(e.detail.items, e.detail.info.trigger)}
            on:finalize={e => finalizeDndTemplates(e.detail.items, e.detail.info.trigger)}
        >
            {#each templateItems as item(item.id)}
                <div class="flex flex-row py-1">
                    <Icon data={mdiPlay} />
                    <span>{getTemplateLabel(item.templateId)}</span>
                </div>
            {/each}
        </div>
    {:else}
        <div class="w-full p-2">
            <span class="text-warning italic">No templates found.</span>
        </div>
    {/if}

    {#each widgetItems as items, index}
        <h2 class="text-xl">{categories[index].label}</h2>
        <div
            class="w-full p-2"
            use:dndzone={{ items, flipDurationMs, centreDraggedOnCursor: true, dropFromOthersDisabled: true}}
            on:consider={e => considerDndWidgets(index, e.detail.items, e.detail.info.trigger)}
            on:finalize={e => finalizeDndWidgets(index, e.detail.items, e.detail.info.trigger)}
        >
            {#each items as item(item.id)}
                <div class="flex flex-row py-1">
                    <Icon data={getWidgetIcon(item.type)} />
                    <span class="ml-2">{getWidgetLabel(item.type)}</span>
                </div>
            {/each}
        </div>
    {/each}
</div>