<script lang="ts">
    import type { Zone } from "$lib/types/Homey";

    export let zone: Zone;
    export let getChildren: any;
    export let select: any;
</script>

<li on:click|stopPropagation={e => select(zone)}>
    <span class="text-sm">{zone.name}</span>
    {#if getChildren(zone.id).length > 0}
        <ul>
            {#each getChildren(zone.id) as item}
                <svelte:self zone={item} getChildren={getChildren} {select} />
            {/each}
        </ul>
    {/if}
</li>