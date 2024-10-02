<script lang="ts">
    import { homey } from "$lib/stores/homey";
    import { createEventDispatcher } from "svelte";
    import Icon from "../Icon.svelte";
    import { getIcon } from "../icons/utils";
    import type { Item } from "./types";
    import ItemElement from "./ItemElement.svelte";

    export let label: string;
    export let items: Item[];
    export let maxItems: number = 5;

    const dispatch = createEventDispatcher();

    $: visible = items.slice(0, Math.min(items.length, maxItems));

    function select(item: Item) {
        dispatch('item', item);
    }

    function view() {
        dispatch('view');
    }
</script>

{#if items.length > 0}
    {#if items.length > maxItems}
        <div class="w-full flex justify-between border-b-2 border-neutral">
            <div class="text-xl m-2">{label}</div>
            <button class="btn btn-primary btn-link" on:click={e => view()}>View {items.length} {label}</button>
        </div>
    {:else}
        <div class="text-xl p-2 border-b-2 border-neutral">{label}</div>
    {/if}

    {#each visible as item}
        <ItemElement {item} on:click={() => select(item)} />
    {/each}
{/if}