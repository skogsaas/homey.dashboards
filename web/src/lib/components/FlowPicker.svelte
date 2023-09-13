<script lang="ts">
    import type { Flow } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from "stwui/list";

    import { flowFolders } from "$lib/stores/homey";

    export let flowId: string | undefined;
    export let flows: Flow[] = [];
    export let placeholder: string = 'Select flow';

    const dispatch = createEventDispatcher();

    interface Item {
        flow: Flow;
        folders: string;
        searchString: string;
    }

    let open: boolean = false;
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

    function onFlow(flow: Flow) {
        flowId = flow.id;
        open = false;
        
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

<Button on:click={() => open = true} class="w-full justify-start">
    {#if selected !== undefined}
        {selected.folders} - {selected.flow.name}
    {:else if flowId !== undefined}
        Flow not found
    {:else}
        {placeholder}
    {/if}
</Button>

<Portal>
    {#if open}
        <Modal handleClose={() => open = false}>
            <Modal.Content slot="content">
                <Modal.Content.Body slot="body" class="h-full flex flex-col">
                    <div>
                        <Input bind:value={search} name="search" placeholder="Search" />
                    </div>
                    <div class="flex-grow overflow-auto">
                        <List>
                            {#each filtered as item}
                                <List.Item class="cursor-pointer" on:click={() => onFlow(item.flow)}>
                                    <List.Item.Content slot="content">
                                        <List.Item.Content.Title slot="title" class="flex">
                                            {item.folders}
                                        </List.Item.Content.Title>
                                        <List.Item.Content.Description slot="description">
                                            {item.flow.name}
                                        </List.Item.Content.Description>
                                    </List.Item.Content>
                                </List.Item>
                            {/each}
                        </List>
                    </div>
                </Modal.Content.Body>
            </Modal.Content>
        </Modal>
    {/if}
</Portal>