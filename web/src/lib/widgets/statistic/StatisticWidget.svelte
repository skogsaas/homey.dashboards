<script lang="ts">
    import Grid from '$lib/components/grid/Grid.svelte';
    import type { GridLayoutItem_v1 } from '$lib/types/Grid';
    import type { WidgetContext, WidgetSettings, WidgetSettingsMap } from '$lib/types/Widgets';
    import { createEventDispatcher } from 'svelte';
    
    import Widget from '../Widget.svelte';
    
    import type { StatisticSettings_v1 } from './StatisticSettings';

    export let item: GridLayoutItem_v1;
    export let settings: StatisticSettings_v1;
    export let widgets: WidgetSettingsMap;



</script>

<div class="stat">
    
</div>