<script lang="ts">
    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import List from 'stwui/list';
    import Icon from 'stwui/icon';

    import { lookup, type IconMetadata, mdiDelete } from "./icons";
    import IconButton from './IconButton.svelte';

    export let iconId: string | undefined;
    export let placeholder: string = 'Select icon'; 

    const limit = 50;

    let open: boolean = false;
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

        open = false;
    }
</script>

<Button on:click={() => open = true} class="w-full justify-start border border-border">
    <span class="mr-1">Icon:</span>

    {#if selected}
        <div class="flex justify-between w-full">
            <Icon data={selected.icon} />
            <IconButton data={mdiDelete} size="14px" on:click={() => iconId = undefined} />
        </div>
    {:else if iconId !== undefined}
        Icon not found
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
                            {#each filtered as icon}
                                <List.Item class="cursor-pointer" on:click={() => selected = icon}>
                                    <List.Item.Content slot="content">
                                        <List.Item.Content.Title slot="title" class="flex">
                                            <Icon data={icon.icon} />
                                        </List.Item.Content.Title>
                                        <List.Item.Content.Description slot="description" class="w-full flex justify-between">
                                            <span>{icon.id}</span>
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