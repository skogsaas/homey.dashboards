<script lang="ts">
    import type { Log } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import { devices } from "$lib/stores/homey";
    import { mdiChartLine, mdiClose, mdiMagnify } from "./icons";
    import Icon from '$lib/components/Icon.svelte'
    import VirtualList from "./VirtualList.svelte";

    export let logId: string | undefined;
    export let logs: Log[] = [];
    export let name: string = 'Log'

    const dispatch = createEventDispatcher();

    interface LogItem {
        log: Log;
        ownerName: string;
        searchString: string;
    }

    let modal: HTMLDialogElement;

    let open: boolean = false;
    let search: string = '';
    let filtered: LogItem[] = [];
    let selected: Log | undefined;

    $: sorted = (logs ?? [])
        .map(log => {
            const ownerName = getOwnerName(log.ownerUri)
            return { log, ownerName, searchString: (`${ownerName} ${log.title}`).toLowerCase() };
        })
        .sort((a, b) => {
            if(a.searchString === b.searchString) return 0;
            if(a.searchString < b.searchString) return -1;
            return 1;
        });

    $: selected = logId !== undefined ? logs.find(d => d.id === logId) : undefined;
    $: filterCapabilities(search, sorted);

    function filterCapabilities(value: string, s: LogItem[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.searchString.includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onItem(item: LogItem) {
        logId = item.log.id;
        open = false;

        modal.close();
        
        dispatch('logId', logId);
    }

    function getOwnerName(uri: string) {
        if(uri.startsWith('homey:device:')) {
            const prefix = 'homey:device:';
            const id = uri.slice(prefix.length);

            return $devices[id]?.name ?? uri;
        } else if(uri.startsWith('homey:manager:apps')) {
            return 'Homey Apps';
        } else if(uri.startsWith('homey:manager:system')) {
            return 'Homey System';
        } else if(uri.startsWith('homey:manager:weather')) {
            return 'Homey Weather';
        } else if(uri.startsWith('homey:manager:logic')) {
            return 'Homey Logic';
        } else {
            return uri;
        }
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{name}</span>
    </div>
    <div class="join flex items-center">
        <input type="text" class="input input-bordered grow join-item" bind:value={logId} placeholder="Log"/>
        <button class="btn btn-outline btn-primary join-item" on:click={() => modal.showModal()}>
            {#if selected !== undefined}
                <Icon data={mdiChartLine} />
            {:else}
                <Icon data={mdiMagnify} />
            {/if}
        </button>
    </div>
    <div class="label whitespace-nowrap overflow-ellipsis">
        <span class="label-text"></span>
        
        {#if selected !== undefined}
            <span class="label-text-alt">{getOwnerName(selected.ownerUri)} - {selected.title}</span>
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
                        {item.ownerName}
                    </h3>
    
                    <div class="w-full flex justify-between">
                        <span>{item.log.title}</span>
                        <span>{item.log.lastValue} {item.log.units}</span>
                    </div>
                </button>

                <div class="divider divider-neutral my-1"></div>
            </VirtualList>
        </div>
    </div>
</dialog>