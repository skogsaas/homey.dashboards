<script lang="ts">
    import NumberInput from "./NumberInput.svelte";
    import Slider from "./Slider.svelte";

    export let variant: 'slider'|'input' = 'slider';
    export let value: number;
    export let disabled: boolean;

    export let min: number | undefined = undefined;
    export let max: number | undefined = undefined;
    export let step: number | undefined = undefined;

    export let unit: string | undefined = undefined;
    export let color: string | undefined = undefined;
    
    $: component = getComponent(variant);

    function getComponent(v: string) {
        switch(v) {
            case 'input': return NumberInput;

            case 'slider': 
            default:
                return Slider;
        }
    }
</script>

<svelte:component 
    this={component}
    bind:value={value}
    {disabled}
    {min}
    {max}
    {step}
    {color}
    {unit}
/>