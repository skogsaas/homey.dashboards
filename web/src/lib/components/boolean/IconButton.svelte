<script lang="ts">
    import IconButton from "../IconButton.svelte";
    import { getIcon } from "../icons/utils";

    export let value: boolean;
    export let disabled: boolean;

    export let icon: string | undefined = undefined;
    export let iconTrue: string | undefined = undefined;
    export let iconFalse: string | undefined = undefined;

    export let color: string | undefined = undefined;
    export let colorTrue: string | undefined = undefined;
    export let colorFalse: string | undefined = undefined;

    const defaultIcon = "help";
    const defaultColor = "text-content";

    $: currentIconTrue = getIcon(iconTrue ?? icon ?? defaultIcon);
    $: currentIconFalse = getIcon(iconFalse ?? icon ?? defaultIcon);

    $: currentColorTrue = colorTrue ?? color ?? defaultColor;
    $: currentColorFalse = colorFalse ?? color ?? defaultColor;

    function setValue(v: boolean) {
        if(!disabled) {
            value = v;
        }
    }
</script>

{#if value}
    <IconButton on:click={() => setValue(false)} data={currentIconTrue} color={currentColorTrue} />
{:else}
    <IconButton on:click={() => setValue(true)} data={currentIconFalse} color={currentColorFalse} />
{/if}