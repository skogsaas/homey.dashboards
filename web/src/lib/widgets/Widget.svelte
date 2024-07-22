<script lang="ts">
    import { findWidget } from '$lib/widgets';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import { createEventDispatcher } from 'svelte';

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
    <div on:click|stopPropagation={() => select()} class="w-full h-full outline-dashed outline-2">
        <svelte:component 
            this={findWidget(settings.type)}
            settings={settings}
            on:settings={e => update(e.detail)}
            context={childContext}
        />
    </div>
{:else}
    <svelte:component 
        this={findWidget(settings.type)}
        {settings}
        {context}
    />
{/if}