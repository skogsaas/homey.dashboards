<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { GridSettings_v1 } from './GridSettings';

    export let settings: GridSettings_v1;

    const dispatch = createEventDispatcher();

    $: onSettings(settings);
    $: onChange();

    function onSettings(s: GridSettings_v1) {
    }

    function onChange() {
    }
</script>
