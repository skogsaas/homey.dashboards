<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SectionSettings_v1 } from './SectionSettings';
    import TextPicker from '$lib/components/TextPicker.svelte';

    export let settings: SectionSettings_v1;

    const dispatch = createEventDispatcher();

    let title: string | undefined;
    let gap: string;

    $: onSettings(settings);
    $: onChange(title, gap);

    function onSettings(s: SectionSettings_v1) {
        title = s.title
        gap = s.gap ?? 'gap-0';
    }

    function onChange(_title: string | undefined, _gap: any) {
        if(settings.title !== _title || settings.gap !== _gap) {
            settings = { ...settings, title: _title, gap: _gap };

            dispatch('settings', settings);
        }
    }
</script>

<TextPicker label="Title" placeholder="" bind:value={title} />

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Gap</span>
    </div>
    <select class="select" bind:value={gap}>
        <option value="gap-0">0 px</option>
        <option value="gap-0.5">2 px</option>
        <option value="gap-1">4 px</option>
        <option value="gap-2">8 px</option>
        <option value="gap-3">12 px</option>
        <option value="gap-4">16 px</option>
        <option value="gap-5">20 px</option>
        <option value="gap-6">24 px</option>
        <option value="gap-7">28 px</option>
        <option value="gap-8">32 px</option>
        <option value="gap-9">36 px</option>
        <option value="gap-10">40 px</option>
    </select>
</label>