<script lang="ts">
    import type { SectionSettings_v1 } from './SectionSettings';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import WidgetList from '$lib/components/WidgetList.svelte';
    
    export let settings: SectionSettings_v1;
    export let context: WidgetContext;

    let items: WidgetSettings_v1[];

    $: onSettings(settings);

    function onSettings(_settings: SectionSettings_v1) {
        items = settings.items ?? [];
    }

    function updateItems(_items: WidgetSettings_v1[]) {
        items = [..._items];
        settings = { ...settings, items };

        context.update(settings);
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

        <WidgetList
            id={settings.id}
            {context}
            {items}
            {updateItems}
            class="flex flex-col w-full {settings.gap ?? 'gap-0'}" 
        />
    </div>
</section>