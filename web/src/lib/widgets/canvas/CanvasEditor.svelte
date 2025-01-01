<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { CanvasSettings_v1 } from "./CanvasSettings";
    import ImageUploader from '$lib/components/ImageUploader.svelte';

    export let settings: CanvasSettings_v1;

    const dispatch = createEventDispatcher();

    let columns: number | undefined;
    let rowHeight: number;

    $: onSettings(settings);
    $: onChange(columns, rowHeight);

    function onSettings(s: CanvasSettings_v1) {
        columns = s.columns;
        rowHeight = s.rowHeight ?? 24;
    }

    function onChange(
        _columns: number|undefined, 
        _rowHeight: number
    ) {
        if(
            settings.columns !== _columns || 
            settings.rowHeight !== _rowHeight
        ) {
            const s = { 
                ...settings, 
                columns: _columns, 
                rowHeight: _rowHeight
            };

            dispatch('settings', s);
        }
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Columns</span>
    </div>
    <input type="number" class="input w-full" placeholder="inherit" bind:value={columns} />
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Row height</span>
        <span class="label-text-alt">px</span>
    </div>
    <input type="number" class="input w-full" placeholder="inherit" bind:value={rowHeight} />
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Background</span>
    </div>
    <ImageUploader />
</label>
