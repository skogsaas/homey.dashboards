<script lang="ts">
    import IconButton from "./IconButton.svelte";
    import IconGroupHorizontal from "./IconGroupHorizontal.svelte";
    import IconGroupVertical from "./IconGroupVertical.svelte";
    import Toggle from "./Toggle.svelte";


    export let variant: 'toggle'|'icon-button'|'icon-group-horizontal'|'icon-group-vertical' = 'toggle';
    export let value: boolean;
    export let disabled: boolean;

    export let icon: string | undefined = undefined;
    export let iconTrue: string | undefined = undefined;
    export let iconFalse: string | undefined = undefined;

    export let color: string | undefined = undefined;
    export let colorTrue: string | undefined = undefined;
    export let colorFalse: string | undefined = undefined;

    $: component = getComponent(variant);

    function getComponent(v: string) {
        switch(v) {
            case 'icon-button': return IconButton;
            case 'icon-group-horizontal': return IconGroupHorizontal;
            case 'icon-group-vertical': return IconGroupVertical;

            case 'toggle': 
            default:
                return Toggle;
        }
    }
</script>

<svelte:component 
    this={component}
    bind:value={value}
    {disabled}
    {icon}
    {iconTrue}
    {iconFalse}
    {color}
    {colorTrue}
    {colorFalse}
/>