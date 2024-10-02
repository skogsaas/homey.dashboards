<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import Icon from '$lib/components/Icon.svelte'

    import { stores } from "$lib/stores/homey";
    import { mdiDatabase } from "./icons";
    import type { Store_v1 } from "$lib/types/Store";

    export let open: boolean = false;
    export let title: string = 'Select store';

    const dispatch = createEventDispatcher();

    let modal: HTMLDialogElement;

    $: flatStores = (Object.values($stores ?? {}))
    $: sorted = (flatStores ?? [])
        .sort((a, b) => {
            if(a.title === b.title) return 0;
            if(a.title < b.title) return -1;
            return 1;
        });

    $: onOpen(open);

    function onOpen(_open: boolean) {
        if(_open) {
            modal.show();
        }
    }

    function select(item: Store_v1) {
        open = false;
        modal.close();
        dispatch('storeId', item.id);
    }
</script>

<dialog bind:this={modal} class="modal">
    <div class="modal-box flex flex-col">
        <div class="text-2xl mb-4">{title}</div>
        <div class="divider divider-neutral my-1"></div>

        <div class="flex-grow overflow-y-auto">
            {#each sorted as item}
                <button class="btn btn-ghost w-full my-2 flex flex-row" on:click={() => select(item)}>
                    <Icon data={mdiDatabase} />

                    <div class="flex flex-row flex-grow justify-between">
                        <span class="text-left text-lg">{item.title}</span>

                        <div class="flex flex-col text-right">
                            <span>Dashboards: {item.dashboards.length}</span>
                            <span>Templates: {item.templates.length}</span>
                        </div>
                    </div>
                </button>
            {/each}
        </div>
    </div>
</dialog>