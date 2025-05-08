<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import {dragHandleZone} from "svelte-dnd-action";
    
    export let editable: boolean;
    export let items: any[] | undefined;
    export let dropDisabled: boolean = false;
    
    let classes: string = '';
    export { classes as class };

    const dispatch = createEventDispatcher();
    const flipDurationMs = 500;

    let inner: any[];
    let modifying: boolean = false;

    const dropTargetClasses = ['border-secondary', 'border-2'];
    const dropTargetStyle = {};

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

        if(info.trigger === 'droppedOutsideOfAny') {
            // When dropped outside of any zone, set the items back to the original list of items
            _items = items ?? [];
        }

        if(info.trigger === 'droppedIntoAnother' && items !== undefined) {
            for (let index = 0; index < _items.length; index++) {
                const item = _items[index] as any;
                const existing = items!.find(i => i.id === item.id) as any | undefined;

                if(existing !== undefined) {
                    // Copy all properties from existing item into current item
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
        use:dragHandleZone={{ items: inner, flipDurationMs, morphDisabled: false, centreDraggedOnCursor: true, dropFromOthersDisabled: dropDisabled, dropTargetStyle, dropTargetClasses }}
        on:consider={e => handleDndConsider(e.detail.items, e.detail.info)}
        on:finalize={e => handleDndFinalize(e.detail.items, e.detail.info)}
    >
        {#each inner as item, index(item.id)}
            <slot {item} {index}></slot>
        {/each}
    </div>
{:else}
    <div class={classes}>
        {#each inner as item, index(item.id)}
            <slot {item} {index}></slot>
        {/each}
    </div>
{/if}