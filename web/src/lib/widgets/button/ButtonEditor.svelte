<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { ButtonSettings_v1 } from './ButtonSettings';
    import type { WidgetContext } from '$lib/types/Widgets';

    const dispatch = createEventDispatcher();
    
    export let settings: ButtonSettings_v1;
    export let context: WidgetContext;

    $: states = Object.values(context.data[settings.id].states);

    let uri: string | undefined;
    let label: string | undefined;
    let iconId: string | undefined;

    let item: any | undefined;

    $: onSettings(settings);
    $: onChange(uri, label, iconId);

    function onSettings(s: ButtonSettings_v1) {
    }

    function onChange(
        _uri: string | undefined, 
        _label: string | undefined, 
        _iconId: string | undefined
    ) {
        
    }
</script>