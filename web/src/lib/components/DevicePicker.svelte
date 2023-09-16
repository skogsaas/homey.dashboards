<script lang="ts">
    import type { DeviceObj } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Drawer from 'stwui/drawer';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from "stwui/list";
    import { homey } from "$lib/stores/homey";

    export let deviceId: string | undefined;
    export let devices: DeviceObj[] = [];
    export let placeholder: string = 'Select device';

    const dispatch = createEventDispatcher();

    let open: boolean = false;
    let search: string = '';
    let filtered: DeviceObj[] = [];
    let selected: DeviceObj | undefined;

    $: sorted = (devices ?? [])
        .sort((a, b) => {
            if(a.name === b.name) return 0;
            if(a.name < b.name) return -1;
            return 1;
        });

    $: selected = deviceId !== undefined ? devices.find(d => d.id === deviceId) : undefined;
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
    {#if selected !== undefined}
        {#await $homey.baseUrl then url}
            <img src={url + selected.iconObj.url} alt={selected.name} class="h-6 w-6 mr-2" />
        {/await}
        {selected.name}
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
                                                <img src={url + device.iconObj.url} alt={device.name} class="h-6 w-6 mr-2" />
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