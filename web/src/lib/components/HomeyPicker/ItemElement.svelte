<script lang="ts">
    import type { Item } from "./types";
    import { homey } from "$lib/stores/homey";
    import { getIcon } from "../icons/utils";
    import Icon from "../Icon.svelte";

    export let item: Item
</script>

<button class="btn btn-ghost w-full my-2" on:click>
    <div class="w-full flex items-center">
        {#if item.iconUrl !== undefined}
            {#await $homey.baseUrl then url}
                <img src={url + item.iconUrl} alt={item.title} class="h-6 w-6 mr-2 dark:invert inline" />
            {/await}
        {:else if item.iconId !== undefined}
            <Icon data={getIcon(item.iconId)} />
        {/if}

        <div class="flex-grow flex flex-col ml-1">
            <span class="text-lg text-start">{item.title}</span>
            <div class="w-full flex justify-between">
                <span>{item.subtitle ?? ''}</span>
                <span>{item.subtitleAlt ?? ''}</span>
            </div>
        </div>
    </div>
</button>