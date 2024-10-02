<script lang="ts">
    import { devices, zones } from "$lib/stores/homey";
    import Icon from "./Icon.svelte";
    import { mdiDatabaseSearchOutline } from "./icons";


export let type: string | undefined;

$: obj = getObject(type);

function getObject(_type: string | undefined) {
    switch(_type) {
        case 'device': return getRandomItem(Object.values($devices));
        case 'capability': return getRandomItem(Object.values($devices).flatMap(device => Object.values(device.capabilitiesObj)));
        case 'zone': return getRandomItem(Object.values($zones));
    }

    return undefined;
}

function getRandomItem(list: any[]) {
    const length = list.length;
    const random = Math.floor(Math.random() * (length - 1));

    return list[random];
}

</script>

{#if obj !== undefined}
    <div class="dropdown dropdown-hover">
        <div role="button" class="btn m-1">Example <Icon data={mdiDatabaseSearchOutline} /></div>
        <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
            {#each Object.keys(obj) as key}
                <li>
                    <span class="max-w-60 overflow-hidden text-nowrap p-1 flex flex-row justify-between"><b>{key}</b> <span>{obj[key]}</span></span>
                </li>
            {/each}
        </ul>
    </div>
{/if}