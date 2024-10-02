<script lang="ts">
    import { findLabel, findWidget } from '$lib/widgets';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import { createEventDispatcher } from 'svelte';
    import { dragHandle } from 'svelte-dnd-action';
    import Icon from '$lib/components/Icon.svelte';
    import { mdiCursorMove } from '$lib/components/icons';
    import type { TemplateSettings_v1 } from './template/TemplateSettings';
    import { templates } from '$lib/stores/homey';

    export let settings: WidgetSettings_v1;
    export let context: WidgetContext;

    $: breadcrumbs = [ ...context.breadcrumbs, { settings, update } ]
    $: childContext = { ...context, breadcrumbs };

    const dispatch = createEventDispatcher();

    function select() {
        context.select(breadcrumbs);
    }

    function update(_settings: WidgetSettings_v1) {
        settings = _settings;
        dispatch('settings', settings);
    }

    function getLabel() {
        if(settings.type === 'template') {
            return $templates[(settings as TemplateSettings_v1).templateId]?.title ?? findLabel(settings.type);
        }

        return findLabel(settings.type);
    }
</script>

{#if context.editable}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <fieldset on:click|stopPropagation={() => select()} class="border-dashed border-2 m-2 mt-0">
        <legend use:dragHandle class="ml-2 cursor-grab">
            <Icon data={mdiCursorMove} class="inline-block w-5 h-5 dark:invert" />
            {getLabel()}
        </legend>
        
        <svelte:component 
            this={findWidget(settings.type)}
            settings={settings}
            on:settings={e => update(e.detail)}
            context={childContext}
        />
    </fieldset>
{:else}
    <svelte:component 
        this={findWidget(settings.type)}
        {settings}
        {context}
    />
{/if}