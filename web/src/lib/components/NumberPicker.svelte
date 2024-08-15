<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let label: string;
    export let placeholder: string;
    export let value: number | undefined;
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{label}</span>
    </div>
    <input type="number" class="input w-full" placeholder={placeholder} bind:value />
</label>