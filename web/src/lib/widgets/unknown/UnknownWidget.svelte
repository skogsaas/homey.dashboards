<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from "$lib/types/Widgets";

    export let settings: WidgetSettings_v1;
    export let context: WidgetContext;
</script>

<div>Unknown widget: {JSON.stringify(settings)}</div>