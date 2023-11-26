<script lang="ts">
    import { InputNumber, Slider } from 'stwui';
    import IconButton from '../IconButton.svelte';
    import { mdiArrowDown, mdiArrowUp, mdiMinus, mdiMinusCircle, mdiPlus, mdiPlusCircle } from '../icons';

    export let value: number;
    export let disabled: boolean;

    export let min: number | undefined = undefined;
    export let max: number | undefined = undefined;
    export let step: number | undefined = undefined;

    export let unit: string | undefined = undefined;
    
    export let color: string | undefined = undefined;

    function increment() {
        let v = value + (step ?? 1);

        if(max !== undefined && max !== null && v > max) {
            v = max;
        }

        if(!disabled) {
            value = v;
        }
    }

    function decrement() {
        let v = value - (step ?? 1);

        if(min !== undefined && min !== null && v > min) {
            v = min;
        }

        if(!disabled) {
            value = v;
        }
    }
</script>

<IconButton on:click={() => decrement()} data={mdiPlus} />

<span class="ml-1 mr-1 whitespace-nowrap">{value} {unit ?? ''}</span>

<IconButton on:click={() => increment()} data={mdiMinus} />