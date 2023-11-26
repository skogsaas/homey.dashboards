<script lang="ts">
    import { Icon } from "stwui";
    import { getIcon } from "../icons/utils";

    export let value: boolean;
    export let disabled: boolean;

    export let icon: string | undefined = undefined;
    export let iconTrue: string | undefined = undefined;
    export let iconFalse: string | undefined = undefined;

    export let color: string | undefined = undefined;
    export let colorTrue: string | undefined = undefined;
    export let colorFalse: string | undefined = undefined;

    const defaultIcon = 'help';
    const defaultColor = 'text-content';

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

<div class="flex flex-col border border-border rounded-md divide-y divide-border">
    <button 
        type="button" 
        class="inline-flex items-center justify-center px-1 py-2 text-sm font-medium text-content first-of-type:rounded-t-md last-of-type:rounded-b-md bg-surface"
        class:hover:bg-hover={!disabled}
        on:click={() => setValue(true)}
    >
        {#if value}
		    <Icon slot="icon" data={currentIconTrue} color={currentColorTrue} />
        {:else}
            <Icon slot="icon" data={currentIconTrue} />
        {/if}
    </button>
    <button 
        type="button" 
        class="inline-flex items-center justify-center px-1 py-2 text-sm font-medium text-content first-of-type:rounded-t-md last-of-type:rounded-b-md bg-surface"
        class:hover:bg-hover={!disabled}
        on:click={() => setValue(false)}
    >
        {#if value}
		    <Icon slot="icon" data={currentIconFalse} />
        {:else}
            <Icon slot="icon" data={currentIconFalse} color={currentColorFalse} />
        {/if}
    </button>
</div>