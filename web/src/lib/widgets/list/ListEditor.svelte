<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { ListSettings_v1 } from './ListSettings';

    export let settings: ListSettings_v1;

    const dispatch = createEventDispatcher();

    let gap: string;

    $: onSettings(settings);
    $: onChange(gap);

    function onSettings(s: ListSettings_v1) {
        gap = s.gap ?? 'gap-0';
    }

    function onChange(_gap: any) {
        if(settings.gap !== _gap) {
            settings = { ...settings, gap: _gap };

            dispatch('settings', settings);
        }
    }
</script>

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