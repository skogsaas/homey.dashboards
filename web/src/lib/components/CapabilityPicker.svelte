<script lang="ts">
    import type { CapabilityObj, DeviceObj } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from "stwui/list";

    import { devices, homey } from "$lib/stores/homey";
    import IconButton from "./IconButton.svelte";
    import { mdiDelete } from "./icons";

    export let capabilityUri: string | undefined;
    export let placeholder: string = 'Select capability';
    export let deviceFilter: ((device: DeviceObj) => boolean) | undefined = undefined;
    export let capabilityFilter: ((capability: CapabilityObj) => boolean) | undefined = undefined;

    const dispatch = createEventDispatcher();

    interface Item  {
        device: DeviceObj;
        capability: CapabilityObj;
        uri: string;
        title: string;
        search: string;
    }

    let open: boolean = false;
    let search: string = '';
    let filtered: Item[] = [];
    let selected: Item | undefined;

    $: flatDevices = (Object.values($devices ?? {})).filter(device => deviceFilter ? deviceFilter(device) : true);
    $: flatCapabilities = flatDevices
        .flatMap(device => Object
            .values(device.capabilitiesObj ?? {})
            .filter(capability => capabilityFilter ? capabilityFilter(capability) : true)
            .map(capability => ({ 
                device, 
                capability, 
                uri: device.uri + ':' + capability.id,
                title: (device.name + ' - ' + capability.title),
                search: (device.name + ' ' + capability.title).toLowerCase()
            })));
    $: sorted = (flatCapabilities ?? [])
        .sort((a, b) => {
            if(a.title === b.title) return 0;
            if(a.title < b.title) return -1;
            return 1;
        });

    $: selected = capabilityUri !== undefined ? flatCapabilities.find(c => c.uri === capabilityUri) ?? undefined : undefined;
    $: filterCapabilities(search, sorted);
    $: onSelected(selected);

    function filterCapabilities(value: string, s: Item[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.search.includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onItem(item: Item) {
        capabilityUri = item.uri;
        open = false;
        
        dispatch('capabilityUri', capabilityUri);
    }

    function onSelected(item: Item | undefined) {
        dispatch('device', item?.device);
        dispatch('capability', item?.capability);
    }
</script>

<Button on:click={() => open = true} class="w-full justify-start border border-border">
    <span class="mr-1">Capability:</span>

    {#if selected}
        {#if selected.capability.iconObj?.url}
            {#await $homey.baseUrl then url}
                <img src={url + selected.capability.iconObj?.url} alt={selected.title} class="h-6 w-6 mr-2 dark:invert" />
            {/await}
        {/if}
        <span class="mr-auto">{selected.title}</span>
        <IconButton data={mdiDelete} size="14px" on:click={() => capabilityUri = undefined} />
    {:else if capabilityUri !== undefined}
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
                            {#each filtered as item}
                                <List.Item class="cursor-pointer" on:click={() => onItem(item)}>
                                    <List.Item.Content slot="content">
                                        <List.Item.Content.Title slot="title" class="flex">
                                            {#await $homey.baseUrl then url}
                                                {#if item.capability?.iconObj?.url}
                                                    <img src={url + item.capability.iconObj.url} alt={item.capability.title} class="h-6 w-6 mr-2 dark:invert" />
                                                {/if}
                                            {/await}
                                            {item.device.name}
                                        </List.Item.Content.Title>
                                        <List.Item.Content.Description slot="description" class="w-full flex justify-between">
                                            <span>{item.capability.title}</span>
                                            <span>{item.capability?.value} {item.capability?.units ?? ''}</span>
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