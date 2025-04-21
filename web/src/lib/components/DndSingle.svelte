<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import DndList from './DndList.svelte';
    
    export let editable: boolean;
    export let item: any | undefined;
    
    let classes: string = 'min-h-[50px]';
    export { classes as class };

    const dispatch = createEventDispatcher();

    let items: any[];
    $: items = item ? [item] : [];
    $: dropDisabled = items.length > 0;

    function onItems(_items: any[]) {
        if(_items.length > 0) {
            item = _items[0];
        } else {
            item = undefined;
        }

        dispatch('item', item);
    }
</script>

<DndList {editable} {items} {dropDisabled} class={classes} on:items={e => onItems(e.detail)} let:item={child}>
    <slot item={child}></slot>
</DndList>