<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    import { editing, dashboard } from '$lib/stores/dashboard';
    
    import Card from 'stwui/card';

    import { findWidget } from '$lib/widgets';
    import type { WidgetSettings } from '$lib/types/Widgets';

    const dispatch = createEventDispatcher();

    export let setting: WidgetSettings;

    $: context = { editing: false, mode: 'card' };
</script>

<Card on:click class="h-full w-full overflow-hidden flex flex-col">
    <svelte:component 
        this={findWidget(setting.type)}
        settings={setting}
        {context}
    />
</Card>