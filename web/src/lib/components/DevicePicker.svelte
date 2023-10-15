<script lang="ts">
    import type { DeviceObj } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from "stwui/list";
    import { devices, homey } from "$lib/stores/homey";
    import IconButton from "./IconButton.svelte";
    import { mdiDelete } from "./icons";

    export let deviceId: string | undefined;
    export let placeholder: string = 'Select device';
    export let deviceFilter: ((device: DeviceObj) => boolean) | undefined = undefined;

    const dispatch = createEventDispatcher();

    let open: boolean = false;
    let search: string = '';
    let filtered: DeviceObj[] = [];
    let selected: DeviceObj | undefined;
    
    $: flatDevices = Object.values($devices).filter(device => deviceFilter ? deviceFilter(device) : true);
    $: sorted = (flatDevices ?? [])
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });

    $: selected = deviceId !== undefined ? flatDevices.find(d => d.id === deviceId) : undefined;
    $: filterDevices(search, sorted);

    function filterDevices(value: string, s: DeviceObj[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.name.toLowerCase().includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onDevice(device: DeviceObj) {
        deviceId = device.id;
        open = false;

        dispatch('deviceId', deviceId);
    }
</script>

<Button on:click={() => open = true} class="w-full justify-start border border-border">
    <span class="mr-1">Device:</span>

    {#if selected !== undefined}
        {#await $homey.baseUrl then url}
            <img src={url + selected.iconObj.url} alt={selected.name} class="h-6 w-6 mr-2 dark:invert" />
        {/await}
        <span class="mr-auto">{selected.name}</span>
        <IconButton data={mdiDelete} size="14px" on:click={() => deviceId = undefined} />
    {:else if deviceId !== undefined}
        Device not found
    {:else}
        {placeholder}
    {/if}
</Button>

<Portal>
    {#if open}
        <Modal handleClose={() => open = false}>
            <Modal.Content slot="content">
                <Modal.Content.Body slot="body" class="h-full">
                    <div>
                        <Input bind:value={search} name="search" placeholder="Search" />
                    </div>
                    <div class="flex-grow overflow-auto">
                        <List>
                            {#each filtered as device}
                                <List.Item class="cursor-pointer" on:click={() => onDevice(device)}>
                                    <List.Item.Content slot="content">
                                        <List.Item.Content.Title slot="title" class="flex">
                                            {#await $homey.baseUrl then url}
                                                <img src={url + device.iconObj.url} alt={device.name} class="h-6 w-6 mr-2 dark:invert" />
                                            {/await}
                                            {device.name}
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