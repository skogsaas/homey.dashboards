<script lang="ts">
    import Icon from 'stwui/icon';

    import { lookup, type IconMetadata, mdiClose, mdiMagnify } from "./icons";
    import { createEventDispatcher } from 'svelte';

    export let iconId: string | undefined;

    const dispatch = createEventDispatcher();
    
    const limit = 50;

    let modal: HTMLDialogElement;

    let search: string = '';
    let filtered: IconMetadata[];
    let selected: IconMetadata | undefined;

    $: filtered = onSearch(search);
    $: onIconId(iconId);
    $: onSelected(selected);

    function onIconId(id: string | undefined) {
        selected = id !== undefined ? lookup.find(icon => icon.id === id) ?? undefined : undefined;
    }

    function onSearch(s: string) {
        if(s.length === 0) {
            return lookup.slice(0, limit);
        } else {
            const result: IconMetadata[] = [];
            const normalized = s.toLowerCase();

            for (let index = 0; index < lookup.length; index++) {
                const item = lookup[index];
                
                if(item.id.includes(normalized)) {
                    result.push(item);

                    if(s.length < 3 && result.length === limit) {
                        break;
                    }
                }
            }

            return result;
        }
    }

    function onSelected(s: IconMetadata | undefined) {
        if(s?.id !== iconId) {
            iconId = s?.id;
        }
    }

    function onItem(item: IconMetadata) {
        selected = item;
        iconId = item.id;
        
        modal.close();
        dispatch('iconId', selected.id);
    }

</script>

<div class="join w-full flex">
    {#if selected}
        <button class="btn join-item rounded-r-full" on:click={() => modal.showModal()}>
            <Icon data={selected.icon} />
        </button>
        
        <input readonly type="text" class="input input-bordered join-item flex-grow" placeholder="Icon" value={selected.id}/>
    {:else}
        <button class="btn join-item rounded-r-full" on:click={() => modal.showModal()}>
            <Icon data={mdiMagnify} />
        </button>
        <input readonly type="text" class="input input-bordered join-item flex-grow" placeholder="Icon"/>
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

            {#if search.length === 0} 
                <div class="mt-2 mb-4">
                    NOTE: There are {lookup.length} icons available. Only {limit} are listed until you enter a search string.
                </div>
            {/if}
        </div>
        
        <div class="flex-grow overflow-auto">
            {#each filtered as icon}
                <button class="btn btn-ghost w-full" on:click={() => onItem(icon)}>
                    <h3 class="w-full flex justify-start">
                        <Icon data={icon.icon} />
                    </h3>
    
                    <div class="w-full flex justify-between">
                        <span>{icon.id}</span>
                    </div>
                </button>

                <div class="divider divider-neutral my-1"></div>
            {/each}
        </div>
    </div>
</dialog>