<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let label: string;
    export let placeholder: string;
    export let value: string | undefined;

    const dispatch = createEventDispatcher()

    $: dispatch('value', value);
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{label}</span>
    </div>
    <input type="text" class="input w-full" {placeholder} bind:value />
</label>