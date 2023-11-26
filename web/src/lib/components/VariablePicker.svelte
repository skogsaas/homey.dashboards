<script lang="ts">
    import type { Variable } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from 'stwui/list';
    import Icon from 'stwui/icon';

    import { variables } from "$lib/stores/homey";
    import IconButton from "./IconButton.svelte";
    import { mdiClose, mdiDelete, mdiVariable } from "./icons";

    export let variableId: string | undefined;
    export let placeholder: string = 'Select variable';
    export let variableFilter: ((device: Variable) => boolean) | undefined = undefined;

    const dispatch = createEventDispatcher();

    let open: boolean = false;
    let search: string = '';
    let filtered: Variable[] = [];
    let selected: Variable | undefined;
    
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

<Button on:click={() => open = true} class="w-full justify-start border border-border">
    <span class="mr-1">Variable:</span>

    {#if selected !== undefined}
        <Icon data={mdiVariable} class="h-6 w-6 mr-2" />

        <span class="mr-auto">{selected.name}</span>
        <IconButton data={mdiDelete} size="14px" on:click={() => variableId = undefined} />
    {:else if variableId !== undefined}
        Variable not found
    {:else}
        {placeholder}
    {/if}
</Button>

<Portal>
    {#if open}
        <Modal handleClose={() => open = false}>
            <Modal.Content slot="content">
                <Modal.Content.Body slot="body" class="h-full">
                    <div class="relative w-full">
                        <div class="absolute -top-4 -right-5 z-10">
                            <IconButton data={mdiClose} on:click={() => open = false} />
                        </div>
                    </div>
                    <div>
                        <Input bind:value={search} name="search" placeholder="Search" />
                    </div>
                    <div class="flex-grow overflow-auto">
                        <List>
                            {#each filtered as variable}
                                <List.Item class="cursor-pointer" on:click={() => onVariable(variable)}>
                                    <List.Item.Content slot="content">
                                        <List.Item.Content.Title slot="title" class="flex">
                                            <Icon data={mdiVariable} class="h-6 w-6 mr-2" />
                                            
                                            {variable.name}
                                        </List.Item.Content.Title>
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