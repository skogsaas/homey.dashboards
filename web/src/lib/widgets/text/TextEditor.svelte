<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import type TextSettings from "./TextSettings";
    
    import TextArea from "stwui/text-area";
    import Select from "stwui/select";

    export let settings: TextSettings;

    const dispatch = createEventDispatcher();

    interface Option {
        value: string;
        label: string;
    }

    let text: string = '';
    let size: Option;

    const sizes = [
        { value: '', label: 'Text'},
        ...[...Array(6).keys()].map(key => ({ value: '' + (key + 1), label: '' + (key + 1) }))
    ];

    $: onText(text);
    $: onSize(size);

    onMount(() => {
        text = settings?.text ?? '';
        size = sizes.find(s => s.value === '')!;
    });

    function onText(value: string | undefined) {
        if(value === undefined || value === settings.text) {
            return;
        }

        dispatch('settings', { ...settings, text: value });
    }

    function onSize(option: Option | undefined) {
        if(option === undefined || Number(option.value) === settings.size) {
            return;
        }

        dispatch('settings', { ...settings, size: Number(option.value) });
    }
</script>

<div style="margin-top: 20px">
    <TextArea  
        bind:value={text} 
        name="text"
        placeholder="Text"
        class="w-full"
    />

    <Select 
        bind:value={size} 
        placeholder="Font size"
        name="size"
    >
        <Select.Options slot="options">
            {#each sizes as option}
                <Select.Options.Option {option} />
            {/each}
        </Select.Options>
    </Select>
</div>