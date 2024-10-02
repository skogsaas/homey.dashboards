<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { mdiInformation } from "$lib/components/icons";
    import TextPicker from "$lib/components/TextPicker.svelte";
    import { createEventDispatcher } from "svelte";
    
    export let operator: string | undefined;
    export let value: string | undefined;

    const dispatch = createEventDispatcher();

    $: dispatch('value', value);
</script>

<TextPicker label="Value" placeholder="Value" bind:value />

{#if operator === 'equal' || operator === 'not-equal'}
    <div role="alert" class="alert my-2">
        <Icon data={mdiInformation} />
        <span>If the value type is expected to be <code>boolean</code>, use numeric values 1/0 for true/false.</span>
    </div>
{/if}