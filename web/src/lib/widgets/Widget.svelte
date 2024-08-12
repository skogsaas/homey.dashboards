<script lang="ts">
    import { findLabel, findWidget } from '$lib/widgets';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import { createEventDispatcher } from 'svelte';
    import { dragHandle } from 'svelte-dnd-action';

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
</script>

{#if context.editable}
    <fieldset on:click|stopPropagation={() => select()} class="border-dashed border-2 m-2 mt-0">
        <legend use:dragHandle class="ml-2c cursor-grab">{findLabel(settings.type)}</legend>
        
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