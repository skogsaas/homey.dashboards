<script lang="ts">
    import type { CapabilityObj, DeviceObj } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Icon from '$lib/components/Icon.svelte'
    import VirtualList from "./VirtualList.svelte";

    import { devices, homey } from "$lib/stores/homey";
    import { mdiClose, mdiMagnify } from "./icons";

    export let capabilityUri: string | undefined;
    export let name: string = 'Capability';
    export let placeholder: string = 'Capability';
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
    $: dispatch('capabilityUri', capabilityUri);

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
    }

    function onSelected(item: Item | undefined) {
        dispatch('device', item?.device);
        dispatch('capability', item?.capability);
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{name}</span>
    </div>
    <div class="join flex items-center">
        <input type="text" class="input input-bordered grow join-item" bind:value={capabilityUri} placeholder={placeholder} />
        <button class="btn btn-outline btn-primary join-item" on:click={() => modal.showModal()}>
            {#await $homey.baseUrl}
                <Icon data={mdiMagnify} />
            {:then url}
                {#if selected !== undefined && selected.capability?.iconObj?.url}
                    <img src={url + selected.capability.iconObj.url} alt={selected.capability.title} class="h-6 w-6 mr-2 dark:invert inline" />
                {:else}
                    <Icon data={mdiMagnify} />
                {/if}
            {/await}
        </button>
    </div>
    <div class="label whitespace-nowrap overflow-ellipsis">
        <span class="label-text"></span>
        
        {#if selected !== undefined}
            <span class="label-text-alt">{selected.title}</span>
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
            <VirtualList items={filtered} height="50vh" let:item>
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
            </VirtualList>
        </div>
    </div>
</dialog>