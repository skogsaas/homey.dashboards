<script lang="ts">
    import type { CapabilityObj, DeviceObj } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Icon from 'stwui/icon';

    import { devices, homey } from "$lib/stores/homey";
    import { mdiClose, mdiMagnify } from "./icons";

    export let capabilityUri: string | undefined;
    export let placeholder: string = 'Select capability';
    export let deviceFilter: ((device: DeviceObj) => boolean) | undefined = undefined;
    export let capabilityFilter: ((capability: CapabilityObj) => boolean) | undefined = undefined;

    const dispatch = createEventDispatcher();

    interface Item  {
        device: DeviceObj;
        capability: CapabilityObj;
        uri: string;
        title: string;
        search: string;
    }

    let modal: HTMLDialogElement;

    let search: string = '';
    let filtered: Item[] = [];
    let selected: Item | undefined;

    $: flatDevices = (Object.values($devices ?? {})).filter(device => deviceFilter ? deviceFilter(device) : true);
    $: flatCapabilities = flatDevices
        .flatMap(device => Object
            .values(device.capabilitiesObj ?? {})
            .filter(capability => capabilityFilter ? capabilityFilter(capability) : true)
            .map(capability => ({ 
                device, 
                capability, 
                uri: device.uri + ':' + capability.id,
                title: (device.name + ' - ' + capability.title),
                search: (device.name + ' ' + capability.title).toLowerCase()
            })));
    $: sorted = (flatCapabilities ?? [])
        .sort((a, b) => {
            if(a.title === b.title) return 0;
            if(a.title < b.title) return -1;
            return 1;
        });

    $: selected = capabilityUri !== undefined ? flatCapabilities.find(c => c.uri === capabilityUri) ?? undefined : undefined;
    $: filterCapabilities(search, sorted);
    $: onSelected(selected);

    function filterCapabilities(value: string, s: Item[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.search.includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onItem(item: Item) {
        capabilityUri = item.uri;
        
        modal.close();
        dispatch('capabilityUri', capabilityUri);
    }

    function onSelected(item: Item | undefined) {
        dispatch('device', item?.device);
        dispatch('capability', item?.capability);
    }
</script>

<div class="join w-full flex">
    {#if selected}
        {#if selected.capability.iconObj?.url}
            {#await $homey.baseUrl then url}
                <button class="btn join-item rounded-r-full" on:click={() => modal.showModal()}>
                    <img src={url + selected.capability.iconObj?.url} alt={selected.title} class="h-6 w-6 dark:invert" />
                </button>
            {/await}
        {/if}
        
        <input readonly type="text" class="input input-bordered join-item flex-grow" placeholder="Capability" value={selected.title}/>
    {:else}
        <button class="btn join-item rounded-r-full" on:click={() => modal.showModal()}>
            <Icon data={mdiMagnify} />
        </button>
        <input readonly type="text" class="input input-bordered join-item flex-grow" placeholder="Capability"/>
    {/if}
</div>

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
            {#each filtered as item}
                <button class="btn btn-ghost w-full" on:click={() => onItem(item)}>
                    <h3 class="w-full flex justify-start">
                        {#await $homey.baseUrl then url}
                            {#if item.capability?.iconObj?.url}
                                <img src={url + item.capability.iconObj.url} alt={item.capability.title} class="h-6 w-6 mr-2 dark:invert inline" />
                            {/if}
                        {/await}
                        {item.device.name}
                    </h3>
    
                    <div class="w-full flex justify-between">
                        <span>{item.capability.title}</span>
                        <span>{item.capability?.value} {item.capability?.units ?? ''}</span>
                    </div>
                </button>

                <div class="divider divider-neutral my-1"></div>
            {/each}
        </div>
    </div>
</dialog>