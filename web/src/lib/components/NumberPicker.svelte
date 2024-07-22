<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let label: string;
    export let placeholder: string;
    export let value: number | undefined;

    let _value: number | undefined;

    $: _value = value;
    $: if(_value !== value) { dispatch('value', _value); }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{label}</span>
    </div>
    <input type="number" class="input w-full" placeholder={placeholder} bind:value={_value} />
</label>