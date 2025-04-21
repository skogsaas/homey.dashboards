<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import type TextSettings from "./TextSettings";

    export let settings: TextSettings;

    const dispatch = createEventDispatcher();

    let text: string = '';
    let size: number;

    $: onText(text);
    $: onSize(size);

    onMount(() => {
        text = settings?.text ?? '';
        size = settings?.size ?? 0;
    });

    function onText(value: string | undefined) {
        if(value === undefined || value === settings.text) {
            return;
        }

        dispatch('settings', { ...settings, text: value });
    }

    function onSize(_size: number) {
        if(_size === settings.size) {
            return;
        }

        dispatch('settings', { ...settings, size: _size });
    }
</script>

<textarea placeholder="Text" class="textarea w-full"></textarea>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Size</span>
    </div>
    <select class="select w-full" bind:value={size}>
        <option value=0>Text</option>
        <option value=1>1</option>
        <option value=2>2</option>
        <option value=3>3</option>
        <option value=4>4</option>
        <option value=5>5</option>
        <option value=6>6</option>
    </select>
</label>