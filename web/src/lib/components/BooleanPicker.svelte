<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let label: string;
    export let value: boolean | undefined;

    let _value: boolean | undefined;

    $: _value = value;
    $: if(_value !== value) { dispatch('value', _value); }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{label}</span>
    </div>
    <input type="checkbox" class="toggle" bind:checked={_value} />
</label>