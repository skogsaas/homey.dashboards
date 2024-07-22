<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { CardSettings_v1 } from "./CardSettings";

    export let settings: CardSettings_v1;

    const dispatch = createEventDispatcher();

    $: onSettings(settings);

    function onSettings(_settings: CardSettings_v1) {
        
    }

    function onChange() {
        /*
        if(
            settings.columns !== _columns || 
            settings.rowHeight !== _rowHeight ||
            settings.margin !== _margin ||
            settings.padding !== _padding
        ) {
            const s = { 
                ...settings, 
                columns: _columns, 
                rowHeight: _rowHeight,
                margin: _margin,
                padding: _padding
            };

            dispatch('settings', s);
        }
        */
    }
</script>
