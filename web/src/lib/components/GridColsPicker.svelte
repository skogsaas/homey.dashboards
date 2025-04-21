<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let value: string;

    const dispatch = createEventDispatcher()

    $: dispatch('value', value);
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Columns</span>
    </div>
    <select class="select" bind:value={value}>
        <option value="grid-cols-1">1 column</option>
        <option value="grid-cols-2">2 columns</option>
        <option value="grid-cols-3">3 columns</option>
        <option value="grid-cols-4">4 columns</option>
        <option value="grid-cols-5">5 columns</option>
        <option value="grid-cols-6">6 columns</option>
        <option value="grid-cols-7">7 columns</option>
        <option value="grid-cols-8">8 columns</option>
        <option value="grid-cols-9">9 columns</option>
        <option value="grid-cols-10">10 columns</option>
        <option value="grid-cols-11">11 columns</option>
        <option value="grid-cols-12">12 columns</option>
    </select>
</label>