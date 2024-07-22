<script lang="ts">
    export let data: string | undefined;
    export let viewBox = '0 0 24 24';
    
    let classes = "inline-block w-6 h-6 invert";
	export { classes as class };
</script>

{#if data !== undefined}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        {viewBox}
        class={classes}
        on:click
        >
        {@html data}
    </svg>
{/if}