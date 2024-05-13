<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { CardSettings_v1 } from "./CardSettings";

    export let settings: CardSettings_v1;

    const dispatch = createEventDispatcher();

    let columns: number | undefined;
    let rowHeight: number;
    let margin: number;
    let padding: number;

    $: onSettings(settings);
    $: onChange(columns, rowHeight, margin, padding);

    function onSettings(s: CardSettings_v1) {
        columns = s.columns;
        rowHeight = s.rowHeight ?? 24;
        margin = s.margin ?? 0;
        padding = s.padding ?? 0;
    }

    function onChange(
        _columns: number|undefined, 
        _rowHeight: number,
        _margin: number,
        _padding: number
    ) {
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
        <span class="label-text">Margin</span>
        <span class="label-text-alt">px</span>
    </div>
    <input type="number" class="input w-full" placeholder="inherit" bind:value={margin} />
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Padding</span>
        <span class="label-text-alt">px</span>
    </div>
    <input type="number" class="input w-full" placeholder="inherit" bind:value={padding} />
</label>
