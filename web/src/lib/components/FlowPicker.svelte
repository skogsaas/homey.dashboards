<script lang="ts">
    import type { Flow } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import { flowFolders } from "$lib/stores/homey";
    import { mdiClose, mdiMagnify } from "./icons";
    import { Icon } from "stwui";

    export let flowId: string | undefined;
    export let flows: Flow[] = [];

    const dispatch = createEventDispatcher();

    interface Item {
        flow: Flow;
        folders: string;
        searchString: string;
    }

    let modal: HTMLDialogElement;

    let search: string = '';
    let filtered: Item[] = [];
    let selected: Item | undefined;

    $: sorted = (flows ?? [])
        .map(flow => {
            const folders = getFolders(flow.folder);
            return { flow, folders, searchString: (`${folders} - ${flow.name}`).toLowerCase() };
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
            filtered = sorted.filter(d => d.searchString.includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onItem(item: Item) {
        flowId = item.flow.id;
        
        modal.close();
        dispatch('flowId', flowId);
    }

    function getFolders(folderId: string) : string {
        const folder = $flowFolders[folderId];

        if(folder?.parent !== undefined && folder.parent !== null) {
            return getFolders(folder.parent) + '/' + folder.name;
        }
        
        return folder?.name ?? '';
    }
</script>

<div class="join w-full flex">
    {#if selected}        
        <input 
            readonly 
            type="text" 
            class="input input-bordered join-item flex-grow" 
            placeholder="Flow" 
            value={selected.folders + '-' + selected.flow.name} 
        />
    {:else}
        <button class="btn join-item rounded-r-full" on:click={() => modal.showModal()}>
            <Icon data={mdiMagnify} />
        </button>
        <input readonly type="text" class="input input-bordered join-item flex-grow" placeholder="Flow"/>
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
                        {item.folders}
                    </h3>
    
                    <div class="w-full flex justify-between">
                        <span>{item.flow.name}</span>
                    </div>
                </button>

                <div class="divider divider-neutral my-1"></div>
            {/each}
        </div>
    </div>
</dialog>