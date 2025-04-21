<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { DialogSettings_v1 } from './DialogSettings';

    export let settings: DialogSettings_v1;

    const dispatch = createEventDispatcher();

    $: onSettings(settings);
    //$: onChange();

    function onSettings(s: DialogSettings_v1) {
        
    }

    /*
    function onChange(_gap: any) {
        if(settings.gap !== _gap) {
            settings = { ...settings, gap: _gap };

            dispatch('settings', settings);
        }
    }
        */
</script>