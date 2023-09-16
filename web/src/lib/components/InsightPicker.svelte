<script lang="ts">
    import type { Log } from "$lib/types/Homey";

    import { createEventDispatcher } from "svelte";

    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from "stwui/list";

    import { devices, homey } from "$lib/stores/homey";

    export let logId: string | undefined;
    export let logs: Log[] = [];
    export let placeholder: string = 'Select log';

    const dispatch = createEventDispatcher();

    interface LogItem {
        log: Log;
        ownerName: string;
        searchString: string;
    }

    let open: boolean = false;
    let search: string = '';
    let filtered: LogItem[] = [];
    let selected: Log | undefined;

    $: sorted = (logs ?? [])
        .map(log => {
            const ownerName = getOwnerName(log.ownerUri)
            return { log, ownerName, searchString: (`${ownerName} ${log.title}`).toLowerCase() };
        })
        .sort((a, b) => {
            if(a.searchString === b.searchString) return 0;
            if(a.searchString < b.searchString) return -1;
            return 1;
        });

    $: selected = logId !== undefined ? logs.find(d => d.id === logId) : undefined;
    $: filterCapabilities(search, sorted);

    function filterCapabilities(value: string, s: LogItem[]) {
        const normalized = value.toLowerCase();

        if(value.length > 0) {
            filtered = sorted.filter(d => d.searchString.includes(normalized));
        } else {
            filtered = sorted;
        }
    }

    function onLog(log: Log) {
        logId = log.id;
        open = false;
        
        dispatch('logId', logId);
    }

    function getOwnerName(uri: string) {
        if(uri.startsWith('homey:device:')) {
            const prefix = 'homey:device:';
            const id = uri.slice(prefix.length);

            return $devices[id].name;
        } else if(uri.startsWith('homey:manager:apps')) {
            return 'Homey Apps';
        } else if(uri.startsWith('homey:manager:system')) {
            return 'Homey System';
        } else if(uri.startsWith('homey:manager:weather')) {
            return 'Homey Weather';
        } else if(uri.startsWith('homey:manager:logic')) {
            return 'Homey Logic';
        } else {
            return uri;
        }
    }
</script>

<Button on:click={() => open = true} class="w-full justify-start border border-border">
    {#if selected !== undefined}
        {getOwnerName(selected.ownerUri)} - {selected.title}
    {:else if logId !== undefined}
        Capability not found
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
                            {#each filtered as item}
                                <List.Item class="cursor-pointer" on:click={() => onLog(item.log)}>
                                    <List.Item.Content slot="content">
                                        <List.Item.Content.Title slot="title">
                                            {item.ownerName}
                                        </List.Item.Content.Title>
                                        <List.Item.Content.Description slot="description" class="w-full flex justify-between">
                                            <span>{item.log.title}</span>
                                            <span>{item.log.lastValue} {item.log.units}</span>
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