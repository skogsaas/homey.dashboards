<script lang="ts">    
    import { dndzone } from "svelte-dnd-action";

    import type { ColumnSettings_v1 } from "./ColumnSettings";
    import type { WidgetContext } from "$lib/types/Widgets";
    import { findWidget } from "..";
    
    export let settings: ColumnSettings_v1;
    export let context: WidgetContext;

    function considerItems(e: any) {
        settings.children = e.detail.items;
    }

    function finalizeItems(e: any) {
        settings.children = e.detail.items;
        context.update(settings);
    }

</script>

{#if context.editing}
    <div 
        class="flex flex-col justify-stretch flex-1 border border-dashed rounded-md p-2 min-h-[20px] min-w-[20px]"
        use:dndzone={{ items: settings.children ?? [], flipDurationMs: 200, centreDraggedOnCursor: true }} 
        on:consider={considerItems} 
        on:finalize={finalizeItems}
    >
        {#each (settings.children ?? []) as child(child.id)}
            {#if context.widgets[child?.id] !== undefined}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div on:click|stopPropagation|preventDefault={() => context.select(child.id)} class="flex-1">
                    <svelte:component this={findWidget(context.widgets[child.id].type)} settings={context.widgets[child.id]} {context} />
                </div>
            {/if}
        {/each}

        {#if (settings.children ?? []).length === 0}
            column
        {/if}
    </div>
{:else} 
    <div class="flex flex-col flex-1 h-full">
        {#each (settings.children ?? []) as child(child.id)}
            <svelte:component this={findWidget(context.widgets[child.id].type)} settings={context.widgets[child.id]} {context} />
        {/each}
    </div> 
{/if}