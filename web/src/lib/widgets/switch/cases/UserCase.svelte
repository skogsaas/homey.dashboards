<script lang="ts">
    import TextPicker from "$lib/components/TextPicker.svelte";
    import { createEventDispatcher } from "svelte";
    
    export let value: string;

    const dispatch = createEventDispatcher();

    $: dispatch('value', value);
    
</script>

<TextPicker label="Value" placeholder="Value" bind:value />