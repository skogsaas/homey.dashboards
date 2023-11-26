<script lang="ts">
    import { Slider } from 'stwui';

    export let value: number;
    export let disabled: boolean;

    export let min: number | undefined = undefined;
    export let max: number | undefined = undefined;
    export let step: number | undefined = undefined;

    export let unit: string | undefined = undefined;
    
    export let color: string | undefined = undefined;

    function setValue(v: number) {
        if(!disabled) {
            value = v;
        }
    }
</script>

<Slider
    name="slider"
    {min}
    {max}
    {step}
    value={value}
    on:value={e => setValue(e.detail)}
    {disabled}
/>