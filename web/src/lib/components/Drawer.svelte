<script lang="ts">
    export let open: boolean = false;
    export let position: 'left'|'right' = 'left';
    export let size: string = '20rem';
    export let backdrop: boolean = false;
</script>

{#if backdrop}
    {#if open}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="backdrop-blur-sm h-full w-full fixed right-0 top-0" style="z-index: 1;" on:click={() => open = false} >
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div 
                class="h-full absolute top-0 bg-surface w-full drop-shadow" 
                class:left-0={position === 'left'}
                class:right-0={position === 'right'}
                style="max-width:{size};"
                on:click|stopPropagation
            >
                <slot></slot>
            </div>
        </div>
    {/if}
{:else}
    {#if open}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
            class="h-full absolute top-0 bg-surface w-full drop-shadow" 
            class:left-0={position === 'left'}
            class:right-0={position === 'right'}
            style="z-index: 1;max-width:{size};"
            on:click|stopPropagation
        >
            <slot></slot>
        </div>
    {/if}
{/if}