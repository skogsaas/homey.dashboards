<script lang="ts">
    export let data: string | undefined;
    export let viewBox = '0 0 24 24';
    export let size = 6;
    
    let classes = "inline-block dark:fill-base-content" + " w-" + size + " h-" + size;
	export { classes as class };

    export let extraClass = "";
</script>

{#if data !== undefined}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <svg
        xmlns="http://www.w3.org/2000/svg"
        {viewBox}
        class={classes + " " + extraClass}
        on:click
        >
        {@html data}
    </svg>
{/if}