<script lang="ts">
    import type { DeviceObj } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import { devices, homey } from "$lib/stores/homey";
    import { mdiClose, mdiMagnify } from "./icons";
    import VirtualList from "./VirtualList.svelte";
    import Icon from "./Icon.svelte";

    export let deviceId: string | undefined;
    export let name: string = 'Device';
    export let deviceFilter: ((device: DeviceObj) => boolean) | undefined = undefined;

    const dispatch = createEventDispatcher();

    let modal: HTMLDialogElement;

    let search: string = '';
    let filtered: DeviceObj[] = [];
    let selected: DeviceObj | undefined;
    
    $: flatDevices = Object.values($devices).filter(device => deviceFilter ? deviceFilter(device) : true);
    $: sorted = (flatDevices ?? [])
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });

    $: selected = deviceId !== undefined ? flatDevices.find(d => d.id === deviceId) : undefined;
    $: filterDevices(search, sorted);
    $: onSelected(selected);

    function filterDevices(value: string, s: DeviceObj[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.name.toLowerCase().includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onDevice(device: DeviceObj) {
        deviceId = device.id;
        modal.close()

        dispatch('deviceId', deviceId);
    }

    function onSelected(device: DeviceObj | undefined) {
        dispatch('device', device);
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{name}</span>
    </div>
    <div class="join flex items-center">
        <input type="text" class="input input-bordered grow join-item" bind:value={deviceId} placeholder="Device"/>
        <button class="btn btn-outline btn-primary join-item" on:click={() => modal.showModal()}>
            {#await $homey.baseUrl}
                <Icon data={mdiMagnify} />
            {:then url}
                {#if selected !== undefined && selected.iconObj?.url}
                    <img src={url + selected.iconObj.url} alt={selected.name} class="h-6 w-6 mr-2 dark:invert inline" />
                {:else}
                    <Icon data={mdiMagnify} />
                {/if}
            {/await}
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
            <VirtualList items={filtered} height="50vh" let:item>
                <button class="btn btn-ghost w-full" on:click={() => onDevice(item)}>
                    <h3 class="w-full flex justify-start">
                        {#await $homey.baseUrl then url}
                            {#if item.iconObj?.url}
                                <img src={url + item.iconObj.url} alt={item.title} class="h-6 w-6 mr-2 dark:invert inline" />
                            {/if}
                        {/await}
                        {item.name}
                    </h3>
    
                    <div class="w-full flex justify-between">
                        <span>{item.title}</span>
                        <span>{item.value} {item.units ?? ''}</span>
                    </div>
                </button>

                <div class="divider divider-neutral my-1"></div>
            </VirtualList>
        </div>
    </div>
</dialog>