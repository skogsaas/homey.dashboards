<script lang="ts">
    import type { Variable } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Icon from '$lib/components/Icon.svelte'

    import { variables } from "$lib/stores/homey";
    import { mdiClose, mdiDelete, mdiMagnify, mdiVariable } from "./icons";
    import VirtualList from "./VirtualList.svelte";

    export let variableId: string | undefined;
    export let placeholder: string = 'Select variable';
    export let variableFilter: ((device: Variable) => boolean) | undefined = undefined;

    const dispatch = createEventDispatcher();

    let open: boolean = false;
    let search: string = '';
    let filtered: Variable[] = [];
    let selected: Variable | undefined;

    let modal: HTMLDialogElement;
    
    $: flatVariables = Object.values($variables).filter(variable => variableFilter ? variableFilter(variable) : true);
    $: sorted = (flatVariables ?? [])
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });

    $: selected = variableId !== undefined ? flatVariables.find(d => d.id === variableId) : undefined;
    $: filterVariables(search, sorted);
    $: onSelected(selected);

    function filterVariables(value: string, s: Variable[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(v => v.name.toLowerCase().includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onVariable(variable: Variable) {
        variableId = variable.id;
        open = false;

        dispatch('variableId', variableId);
    }

    function onSelected(variable: Variable | undefined) {
        dispatch('variable', variable);
    }
</script>

<div class="join w-full flex">
    {#if selected}
        <button class="btn join-item rounded-r-full" on:click={() => modal.showModal()}>
            <Icon data={mdiVariable} class="h-6 w-6 mr-2" />
        </button>
        
        <input readonly type="text" class="input input-bordered join-item flex-grow" placeholder="Variable" value={selected.name}/>
    {:else}
        <button class="btn join-item rounded-r-full" on:click={() => modal.showModal()}>
            <Icon data={mdiMagnify} />
        </button>
        <input readonly type="text" class="input input-bordered join-item flex-grow" placeholder="Variable"/>
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
            <VirtualList items={filtered} height="50vh" let:item>
                <button class="btn btn-ghost w-full" on:click={() => onVariable(item)}>
                    <h3 class="w-full flex justify-start">
                        <Icon data={mdiVariable} class="h-6 w-6 mr-2" />
                        {item.name}
                    </h3>
    
                    <div class="w-full flex justify-between">
                        <span>{item.type}</span>
                        <span>{item.value}</span>
                    </div>
                </button>

                <div class="divider divider-neutral my-1"></div>
            </VirtualList>
        </div>
    </div>
</dialog>