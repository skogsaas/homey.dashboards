<script lang="ts">
    import { mdiMinus, mdiPlus } from '../icons';
    import Icon from '../Icon.svelte';

    export let value: number;
    export let disabled: boolean;

    export let min: number | undefined = undefined;
    export let max: number | undefined = undefined;
    export let step: number | undefined = undefined;

    export let unit: string | undefined = undefined;

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

<button class="btn" on:click={() => decrement()} >
    <Icon data={mdiMinus} />
</button>

<span class="ml-1 mr-1 whitespace-nowrap">{value} {unit ?? ''}</span>

<button class="btn" on:click={() => decrement()} >
    <Icon data={mdiPlus} />
</button>