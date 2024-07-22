<script lang="ts">
    import type { Flow, FlowFolder } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import { homey, flowFolders } from "$lib/stores/homey";
    import { mdiClose, mdiFolder, mdiMagnify } from "./icons";
    import Icon from '$lib/components/Icon.svelte'
    import VirtualList from "./VirtualList.svelte";

    export let flowId: string | undefined;
    export let flows: Flow[] = [];
    export let name: string = 'Flow';

    const dispatch = createEventDispatcher();

    interface Item {
        flow: Flow;
        folders: FlowFolder[];
        searchString: string;
    }

    let modal: HTMLDialogElement;

    let search: string = '';
    let filtered: Item[] = [];
    let selected: Item | undefined;

    $: sorted = (flows ?? [])
        .map(flow => {
            const folders = getFolders(flow.folder);
            return { flow, folders, searchString: (folders.map(f => f.name).join('/') + ' - ' + flow.name).toLowerCase() };
        })
        .sort((a, b) => {
            if(a.searchString === b.searchString) return 0;
            if(a.searchString < b.searchString) return -1;
            return 1;
        });

    $: selected = flowId !== undefined ? sorted.find(f => f.flow.id === flowId) : undefined;
    $: filterFlows(search, sorted);

    function filterFlows(value: string, s: Item[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = s.filter(d => d.searchString.includes(normalized));
        } else {
            filtered = s;
        }
    }

    function onItem(item: Item) {
        flowId = item.flow.id;
        
        modal.close();
        dispatch('flowId', flowId);
    }

    function getFolders(folderId: string) : FlowFolder[] {
        const folder = $flowFolders[folderId];

        if(folder?.parent !== undefined && folder.parent !== null) {
            return [folder, ...getFolders(folder.parent)];
        }
        
        return folder !== undefined ? [folder] : [];
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{name}</span>
    </div>
    <div class="join flex items-center">
        <input type="text" class="input input-bordered grow join-item" bind:value={flowId} placeholder="Flow"/>
        <button class="btn btn-outline btn-primary join-item" on:click={() => modal.showModal()}>
            <Icon data={mdiMagnify} />
        </button>
    </div>
    <div class="label whitespace-nowrap overflow-ellipsis">
        <span class="label-text"></span>

        {#if selected !== undefined && selected.folders.length > 0}
            <span class="label-text-alt">{selected.folders.map(f => f.name).join('/')} - {selected.flow.name}</span>
        {:else if selected !== undefined}
            <span class="label-text-alt">{selected.flow.name}</span>
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
            <ul class="menu bg-base-200 rounded-box">
                <VirtualList items={filtered} height="50vh" let:item>
                    <li>
                        <a on:click={() => onItem(item)}>
                            {#if item.folders.length == 0}
                                <span></span>
                            {/if}

                            {#each item.folders as folder}
                                <span>
                                    <Icon data={mdiFolder} />
                                    {folder.name}
                                </span>
                            {/each}
                            
                            <span></span>
                            {item.flow.name}
                        </a>
                    </li>
                </VirtualList>
            </ul>
        </div>
    </div>
</dialog>