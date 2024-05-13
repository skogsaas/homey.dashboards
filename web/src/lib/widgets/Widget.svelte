<script lang="ts">
    import { findWidget } from '$lib/widgets';
    import type { WidgetSettings } from '$lib/types/Widgets';
    import type { GridItemLayout_v1 } from '$lib/types/Grid';
    import { createEventDispatcher } from 'svelte';

    export let item: GridItemLayout_v1;
    export let settings: WidgetSettings;
    export let editable: boolean;

    const dispatch = createEventDispatcher();

    function updateSettings(_settings: WidgetSettings) {
        settings = _settings;
        dispatch('settings', settings);
    }
</script>

<svelte:component 
    this={findWidget(settings.type)}
    settings={settings}
    on:settings={e => updateSettings(e.detail)}
    {editable}
    {item}
/>