<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SectionSettings_v1 } from './SectionSettings';
    import TextPicker from '$lib/components/TextPicker.svelte';

    export let settings: SectionSettings_v1;

    const dispatch = createEventDispatcher();

    let title: string | undefined;

    $: onSettings(settings);
    $: onChange(title);

    function onSettings(s: SectionSettings_v1) {
        title = s.title
    }

    function onChange(_title: string | undefined) {
        if(settings.title !== _title) {
            settings = { ...settings, title: _title };

            dispatch('settings', settings);
        }
    }
</script>

<TextPicker label="Title" placeholder="" value={title} on:value={e => title = e.detail}/>