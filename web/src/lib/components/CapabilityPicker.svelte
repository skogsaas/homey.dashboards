<script lang="ts">
    import type { CapabilityObj } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from "stwui/list";

    import { homey } from "$lib/stores/homey";

    export let capabilityId: string | undefined;
    export let capabilities: CapabilityObj[] = [];
    export let placeholder: string = 'Select capability';

    const dispatch = createEventDispatcher();

    let open: boolean = false;
    let search: string = '';
    let filtered: CapabilityObj[] = [];
    let selected: CapabilityObj | undefined;

    $: sorted = (capabilities ?? [])
        .sort((a, b) => {
            if(a.title === b.title) return 0;
            if(a.title < b.title) return -1;
            return 1;
        });

    $: selected = capabilityId !== undefined ? capabilities.find(d => d.id === capabilityId) ?? undefined : undefined;
    $: filterCapabilities(search, sorted);

    function filterCapabilities(value: string, s: CapabilityObj[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.title.toLowerCase().includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onCapability(capability: CapabilityObj) {
        capabilityId = capability.id;
        open = false;
        
        dispatch('capabilityId', capabilityId);
    }
</script>

<Button on:click={() => open = true} class="w-full justify-start border border-border">
    {#if selected}
        {#if selected.iconObj?.url}
            {#await $homey.baseUrl then url}
                <img src={url + selected.iconObj?.url} alt={selected.title} class="h-6 w-6 mr-2" />
            {/await}
        {/if}
        {selected.title}
    {:else if capabilityId !== undefined}
        Capability not found
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
                            {#each filtered as capability}
                                <List.Item class="cursor-pointer" on:click={() => onCapability(capability)}>
                                    <List.Item.Content slot="content">
                                        <List.Item.Content.Title slot="title" class="flex">
                                            {#await $homey.baseUrl then url}
                                                {#if capability?.iconObj?.url}
                                                    <img src={url + capability.iconObj.url} alt={capability.title} class="h-6 w-6 mr-2" />
                                                {/if}
                                            {/await}
                                            {capability.title}
                                        </List.Item.Content.Title>
                                        <List.Item.Content.Description slot="description" class="w-full flex justify-between">
                                            <span>{capability?.value} {capability?.units ?? ''}</span>
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