<script lang="ts">
    export let label: string;
    export let checked: boolean | undefined;
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{label}</span>
    </div>
    <input type="checkbox" class="toggle" bind:checked />
</label>