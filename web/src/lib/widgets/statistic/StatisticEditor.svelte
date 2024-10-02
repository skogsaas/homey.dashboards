<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { StatisticSettings_v1 } from "./StatisticSettings";
    import InsightPicker from '$lib/components/InsightPicker.svelte';
    import { insights } from '$lib/stores/homey';

    export let settings: StatisticSettings_v1;

    const dispatch = createEventDispatcher();

    let insightId: string | undefined;
    let title: string | undefined;

    $: onSettings(settings);
    $: onChange(insightId, title);

    function onSettings(s: StatisticSettings_v1) {
        insightId = s.insightId;
        title = s.title;
    }

    function onChange(
        _insightId: string | undefined,
        _title: string | undefined
    ) {
        if(
            settings.insightId !== _insightId || 
            settings.title !== _title
        ) {
            const s = { 
                ...settings, 
                insightId: _insightId,
                title: _title
            };

            dispatch('settings', s);
        }
    }
</script>

<InsightPicker bind:logId={insightId} logs={Object.values($insights)} />