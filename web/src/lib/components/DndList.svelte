<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import {dndzone} from "svelte-dnd-action";
    
    export let editable: boolean;
    export let items: any[] | undefined;
    
    let classes: string = '';
    export { classes as class };

    const dispatch = createEventDispatcher();
    const flipDurationMs = 300;

    let inner: any[];
    let modifying: boolean = false;

    $: onItems(items);

    function onItems(_items: any[] | undefined) {
        // Do not accept any new items while an item is being dragged from this list.
        if(!modifying) {
            inner = _items ?? [];
        }
    }

    function handleDndConsider(_items: any[], info: any) {
        // Detect if an item has started to drag from this list to another list.
        if(info.trigger === 'dragStarted') {
            modifying = true;
        }

        inner = _items;
    }
    function handleDndFinalize(_items: any[], info: any) {
        modifying = false;

        if(info.trigger === 'droppedIntoAnother' && items !== undefined) {
            for (let index = 0; index < _items.length; index++) {
                const item = _items[index] as any;
                const existing = items!.find(i => i.id === item.id) as any | undefined;

                if(existing !== undefined) {
                    // Copy app properties from existing item into current item
                    for(var key in existing) {
                        item[key] = existing[key];
                    }
                }
            }
        }

        inner = [ ..._items ];
        items = inner;
        dispatch('items', items);
    }
</script>

{#if editable}
    <div
        class={classes}
        use:dndzone={{ items: inner, flipDurationMs, morphDisabled: true }}
        on:consider={e => handleDndConsider(e.detail.items, e.detail.info)}
        on:finalize={e => handleDndFinalize(e.detail.items, e.detail.info)}
    >
        {#each inner as item(item.id)}
            <slot {item}></slot>
        {/each}
    </div>
{:else}
    <div class={classes}>
        {#each inner as item(item.id)}
            <slot {item}></slot>
        {/each}
    </div>
{/if}