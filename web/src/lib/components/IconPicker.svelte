<script lang="ts">
    import Icon from '$lib/components/Icon.svelte'

    import { lookup, type IconMetadata, mdiClose, mdiMagnify } from "./icons";
    import { createEventDispatcher } from 'svelte';
    import VirtualList from './VirtualList.svelte';

    export let iconId: string | undefined;
    export let name: string = 'Icon';

    const dispatch = createEventDispatcher();
    
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
            return lookup;
        } else {
            const result: IconMetadata[] = [];
            const normalized = s.toLowerCase();

            for (let index = 0; index < lookup.length; index++) {
                const item = lookup[index];
                
                if(item.id.includes(normalized)) {
                    result.push(item);
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

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{name}</span>
    </div>
    <div class="join flex items-center">
        <input type="text" class="input input-bordered grow join-item" bind:value={iconId} placeholder="Icon"/>
        <button class="btn btn-outline btn-primary join-item" on:click={() => modal.showModal()}>
            {#if selected !== undefined}
                <Icon data={selected.icon} />
            {:else}
                <Icon data={mdiMagnify} />
            {/if}
        </button>
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
                        <Icon data={item.icon} />
                    </h3>
    
                    <div class="w-full flex justify-between">
                        <span>{item.id}</span>
                    </div>
                </button>

                <div class="divider divider-neutral my-1"></div>
            </VirtualList>
        </div>
    </div>
</dialog>