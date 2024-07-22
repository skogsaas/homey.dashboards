<script lang="ts">
    import Icon from '$lib/components/Icon.svelte'

    export let top: string = "0px";
    export let bottom: string = "0px";
    export let left: string = "0px";
    export let right: string = "0px";

</script>

<div class="flex flex-col justify-stretch">
    <div class="w-full content-center">
        <Input name="top" bind:value={top} />
    </div>

    <div class="w-full content-between">
        <Input name="left" bind:value={left} />
        <Input name="right" bind:value={right} />
    </div>

    <div class="w-full content-center">
        <Input name="bottom" bind:value={bottom} />
    </div>
</div>