<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import Select, { Option } from "@smui/select";
    import type TextSettings from "./TextSettings";
    import Textfield from '@smui/textfield';

    export let settings: TextSettings;

    const dispatch = createEventDispatcher();

    let text: string = '';
    let size: number | undefined;

    $: onText(text);
    $: onSize(size);

    onMount(() => {
        text = settings?.text ?? '';
        size = settings?.size;
    });

    function onText(value: string | undefined) {
        if(value === undefined || value === settings.text) {
            return;
        }

        dispatch('settings', { ...settings, text: value });
    }

    function onSize(value: number | undefined) {
        if(value === settings.size) {
            return;
        }

        dispatch('settings', { ...settings, size: value });
    }
</script>

<div style="margin-top: 20px">
    <Textfield 
        bind:value={text} 
        label="Text"
        textarea
        style="width: 100%;"
    >
    </Textfield>

    <Select 
        bind:value={size} 
        label="Font size"
        style="width: 100%;"
    >
        <Option value="1">1</Option>
        <Option value="2">2</Option>
        <Option value="3">3</Option>
        <Option value="4">4</Option>
        <Option value="5">5</Option>
        <Option value="6">6</Option>
    </Select>
</div>