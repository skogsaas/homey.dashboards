<script lang="ts">
    import type { CapabilityObj, DeviceMap, DeviceObj, Variable, VariableMap, Zone, ZoneMap } from "$lib/types/Homey";
    import { homey, zones, variables, devices } from '$lib/stores/homey';

    import { createEventDispatcher } from "svelte";

    import Icon from '$lib/components/Icon.svelte'
    import VirtualList from "../VirtualList.svelte";

    import { mdiArrowLeft, mdiClose, mdiMagnify } from "../icons";
    import type { Item } from "./types";
    import ItemSection from "./ItemSection.svelte";
    import ItemElement from "./ItemElement.svelte";

    export let uri: string | undefined;
    export let label: string = 'Item';
    export let placeholder: string = '';
    
    export let zoneFilter: ((zone: Zone) => boolean) = z => false;
    export let variableFilter: ((variable: Variable) => boolean) = v => false;
    export let deviceFilter: ((device: DeviceObj) => boolean) = d => false;
    export let capabilityFilter: ((device: DeviceObj, capability: CapabilityObj) => boolean) = c => false;

    const dispatch = createEventDispatcher();

    const types = ['zone', 'variable', 'device', 'capability'];
    const labels = ['Zones', 'Variables', 'Devices', 'Capabilities'];

    let modal: HTMLDialogElement;

    let allZones: Item[] = [];
    let allVariables: Item[] = [];
    let allDevices: Item[] = [];
    let allCapabilities: Item[] = [];

    let filtered: Item[] = [];

    let search: string = '';
    let selected: Item | undefined;

    let viewType: string | undefined;
    let viewItems: Item[] | undefined;

    $: allZones = Object.values($zones ?? {})
        .filter(zone => zoneFilter(zone))
        .map(zone => ({
            zone,
            uri: zone.uri,
            title: zone.name,
            iconId: 'file-tree',
            search: zone.name.toLocaleLowerCase(),
            type: 'zone'
        } as Item))
        .sort((a, b) => {
            if(a.title === b.title) return 0;
            if(a.title < b.title) return -1;
            return 1;
        });

    $: allVariables = (Object.values($variables ?? {}))
        .filter(variable => variableFilter(variable))
        .map(variable => ({ 
            variable,
            uri: variable.uri,
            title: variable.name,
            subtitle: variable.type,
            subtitleAlt: variable.value,
            iconId: 'variable',
            search: variable.name.toLowerCase(),
            type: 'variable'
        } as Item))
        .sort((a, b) => {
            if(a.title === b.title) return 0;
            if(a.title < b.title) return -1;
            return 1;
        });

    $: allDevices = Object.values($devices ?? {})
        .filter(device => deviceFilter(device))
        .map(device => ({ 
            device,
            uri: device.uri,
            title: device.name,
            iconUrl: device.iconObj?.url,
            iconId: 'meter-electric',
            search: device.name.toLowerCase(),
            type: 'device'
        } as Item))
        .sort((a, b) => {
            if(a.title === b.title) return 0;
            if(a.title < b.title) return -1;
            return 1;
        });

    $: allCapabilities = Object.values($devices ?? {})
        .flatMap(device => Object.values(device.capabilitiesObj ?? {})
            .filter(capability => capabilityFilter ? capabilityFilter(device, capability) : false)
            .map(capability => ({ 
                device: device, 
                capability, 
                uri: device.uri + ':' + capability.id,
                title: capability.title,
                subtitle: device.name,
                subtitleAlt: (capability.value ?? '') + ' ' + (capability.units ?? ''),
                iconUrl: capability.iconObj?.url,
                iconId: 'tune',
                search: (device.name + ' ' + capability.title).toLowerCase(),
                type: 'capability'
            } as Item)))
            .sort((a, b) => {
                if(a.title === b.title) return 0;
                if(a.title < b.title) return -1;
                return 1;
            });

    $: items = [...allZones, ...allVariables, ...allDevices, ...allCapabilities];

    $: select(uri);
    $: filter(search, items);
    $: view(viewType, items);
    $: onSelected(selected);

    function select(_uri: string | undefined) {
        if(_uri === undefined) {
            selected = undefined;
            return;
        }

        if(selected !== undefined && selected.uri === _uri) {
            return;
        }

        selected = items.find(i => i.uri === _uri);
    }

    function filter(_search: string, _items: Item[]) {
        const normalized = _search.toLowerCase();

        if(_search.length >= 1) {
            filtered = items.filter(item => item.search.includes(normalized));
        } else {
            filtered = items;
        }

        view(viewType, filtered);
    }

    function view(_type: string | undefined, _items: Item[]) {
        if(_type === undefined) {
            viewItems = undefined;
            return;
        }

        viewItems = filtered.filter(i => i.type === _type);
    }

    function getItems(_type: string, _items: Item[]) {
        return _items.filter(i => i.type === _type);
    }

    function onItem(item: any) {
        uri = item.uri;
        
        modal.close();
        dispatch('uri', uri);
    }

    function onView(mode: any) {
        viewType = mode;
    }

    function onSelected(item: any | undefined) {
        dispatch('item', item);
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{label}</span>
    </div>
    <div class="join flex items-center">
        <input type="text" class="input input-bordered grow join-item" bind:value={uri} placeholder={placeholder} />
        <button class="btn btn-outline btn-primary join-item" on:click={() => modal.showModal()}>
            {#if selected !== undefined && selected.iconUrl !== undefined}
                {#await $homey.baseUrl}
                    <Icon data={mdiMagnify} />
                {:then url}
                    <img src={url + selected.iconUrl} alt={selected.title} class="h-6 w-6 mr-2 dark:invert inline" />
                {/await}
            {:else}
                <Icon data={mdiMagnify} />
            {/if}
        </button>
    </div>
    {#if selected !== undefined}
        <div class="label whitespace-nowrap overflow-ellipsis">
            <span class="label-text"></span>
            
            {#if selected !== undefined}
                <span class="label-text-alt">{selected.title}</span>
            {/if}
        </div>
    {/if}
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
            {#if viewType === undefined}
                {#each types as type, index}
                    <ItemSection label={labels[index]} items={getItems(type, filtered)} on:item={e => onItem(e.detail)} on:view={e => onView(type)} />
                {/each}
            {:else}
                <div class="w-full flex justify-between items-center">
                    <button class="btn btn-ghost" on:click={e => (viewType = undefined)}>
                        <Icon data={mdiArrowLeft} /> 
                        Back
                    </button>
                    <span class="text-secondary">Viewing {viewItems?.length} {labels[types.indexOf(viewType)]}</span>
                </div>

                <VirtualList items={viewItems} height="50vh" let:item>
                    <ItemElement {item} on:click={() => onItem(item)} />
                </VirtualList>
            {/if}
        </div>
    </div>
</dialog>