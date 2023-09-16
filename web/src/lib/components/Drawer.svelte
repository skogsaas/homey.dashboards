<script lang="ts">
    export let open: boolean = false;
    export let position: 'left'|'right' = 'left';
    export let size: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl' = 'sm';

</script>

{#if open}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="backdrop-blur-sm h-full w-full fixed right-0 top-0" style="z-index: 1;" on:click={() => open = false} >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
            class="h-full absolute right-0 top-0 bg-surface w-full drop-shadow p-3 overflow-auto" 
            class:left-0={position === 'left'}
            class:right-0={position === 'right'}
            class:max-w-xs={size === 'xs'}
            class:max-w-sm={size === 'sm'}
            class:max-w-md={size === 'md'}
            class:max-w-lg={size === 'lg'}
            class:max-w-xl={size === 'xl'}
            class:max-w-2xl={size === '2xl'}
            on:click|stopPropagation
        >
            <slot></slot>
        </div>
    </div>
{/if}