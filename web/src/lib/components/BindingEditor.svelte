<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import StateBindingPicker from '$lib/components/StateBindingPicker.svelte';
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';

    const dispatch = createEventDispatcher();
    
    export let settings: WidgetSettings_v1;
    export let context: WidgetContext;

    $: keys = Object.keys(context.data[settings.id]?.states ?? {});

    function getState(key: string) {
        return context.data[settings.id]?.states[key];
    }

    function getBinding(key: string) {
        return (settings as any)[key];
    }

    function setBinding(key: string, value: any) {
        (settings as any)[key] = value;
        dispatch('settings', { ...settings, [key]: value });
    }
</script>

{#each keys as key}
    <StateBindingPicker
        context={context}
        state={getState(key)}
        binding={getBinding(key)}
        on:binding={e => setBinding(key, e.detail)} />
{/each}