<script lang="ts">
    import type { DeviceObj, Zone } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import { devices, homey, zones } from "$lib/stores/homey";
    import { mdiClose, mdiMagnify } from "./icons";
    import VirtualList from "$lib/components/VirtualList.svelte";
    import Icon from "./Icon.svelte";
    import ZonePickerItem from "./ZonePickerItem.svelte";

    export let zoneId: string | undefined;
    export let label: string = 'Zone';
    export let zoneFilter: ((zone: Zone) => boolean) | undefined = undefined;

    const dispatch = createEventDispatcher();

    let modal: HTMLDialogElement;

    let search: string = '';
    let sorted: Zone[] = [];
    let filtered: Zone[] = [];
    let selected: Zone | undefined;
    
    $: flatZones = Object.values($zones).filter(zone => zoneFilter ? zoneFilter(zone) : true);
    $: sorted = (flatZones ?? [])
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });

    $: root = sorted.find(zone => zone.parent === null)!;

    $: selected = zoneId !== undefined ? sorted.find(zone => zone.id === zoneId) : undefined;
    $: filterZones(search, sorted);
    $: onSelected(selected);

    function filterZones(value: string, _zones: any[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.name.toLowerCase().includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onZone(zone: Zone) {
        zoneId = zone.id;
        modal.close()

        dispatch('zoneId', zoneId);
    }

    function onSelected(zone: Zone | undefined) {
        dispatch('zone', zone);
    }

    function getChildren(parentId: string) : Zone[] {
        return sorted.filter(zone => zone.parent === parentId);
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{label}</span>
    </div>
    <div class="join flex items-center">
        <input type="text" class="input input-bordered grow join-item" bind:value={zoneId} placeholder="Zone"/>
        <button class="btn btn-outline btn-primary join-item" on:click={() => modal.showModal()}>
            <Icon data={mdiMagnify} />
        </button>
    </div>
    <div class="label whitespace-nowrap overflow-ellipsis">
        <span class="label-text"></span>
        
        {#if selected !== undefined}
            <span class="label-text-alt">{selected.name}</span>
        {/if}
    </div>
</label>

<dialog bind:this={modal} class="modal">
    <div class="modal-box flex flex-col">
        <div class="flex-shrink-0 mb-2">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <Icon data={mdiClose} />
                </button>
            </form>
            
            <input type="text" class="input w-full input-primary" bind:value={search} name="search" placeholder="Search" />
        </div>
        
        <div class="flex-grow overflow-auto">
            <ul class="menu">
                <ZonePickerItem zone={root} getChildren={getChildren} select={onZone} />
            </ul>
        </div>
    </div>
</dialog>