<script lang="ts">
    import type { WidgetContext, WidgetDataObject, WidgetState, WidgetStateBinding } from "$lib/types/Widgets";
    import { createEventDispatcher, onDestroy } from "svelte";
    import { type Unsubscriber } from "svelte/store";
    import Icon from "./Icon.svelte";
    import { mdiClose } from "./icons";
    import VirtualList from "./VirtualList.svelte";
    import IconPicker from "./IconPicker.svelte";

    export let context: WidgetContext;
    export let state: WidgetState;
    export let binding: undefined | string | number | boolean | WidgetStateBinding;

    const dispatch = createEventDispatcher();

    let modal: HTMLDialogElement;
    let modalType: string | undefined = undefined;
    let modalTypes: string[];
    let modalObjectId: string | undefined = undefined;
    let modalObject: WidgetDataObject | undefined = undefined;
    let modalObjects: { [key: string]: { [key: string]: WidgetDataObject } } = {};
    let modalStateId: string | undefined = undefined;
    let modalState: WidgetState | undefined = undefined;
    let modalStates: [string, WidgetState][] = [];

    let stateMode: 'static' | 'binding' = 'static';
    
    let bindingObject: WidgetDataObject | undefined = undefined;
    let bindingState: WidgetState | undefined = undefined;
    let value: any | undefined = undefined;
    let unsubscriber: Unsubscriber | undefined = undefined;

    $: onBinding(binding);
    $: modalTypes = Object.values(context.data).reduce((results, obj) => {
        if (!results.includes(obj.type)) {
            results.push(obj.type);
        }
        return results;
    }, [] as string[]);
    $: modalObjects = modalType !== undefined ? filterModalObjects(context.data) : {};
    $: modalStates = modalObject !== undefined ? filterModalStates(modalObject) : [];

    onDestroy(() => {
        if (unsubscriber !== undefined) {
            unsubscriber();
            unsubscriber = undefined;
        }
    });

    function onBinding(_binding: undefined | string | number | boolean | WidgetStateBinding) {
        stateMode = typeof _binding === 'object' ? 'binding' : 'static';

        if (unsubscriber !== undefined) {
            unsubscriber();
            unsubscriber = undefined;
            value = undefined;
        }

        if(_binding !== undefined && typeof _binding === 'object') {
            const { objectId, stateId }: WidgetStateBinding = _binding;
            bindingObject = context.data[objectId];

            if(bindingObject !== undefined) {
                bindingState = bindingObject.states[stateId];

                if(bindingState !== undefined) {
                    unsubscriber = bindingState.value.subscribe((v: any) => { value = v; });
                }
            }
        }
    }

    function onString(e: any) {
        binding = e.target.value;
        dispatch('binding', binding);
    }

    function onNumber(e: any) {
        binding = e.target.value;
        dispatch('binding', binding);
    }

    function onBoolean() {
        binding = !(binding === true);
        dispatch('binding', binding);
    }

    function onEnum(e: any) {
        binding = e.target.value;
        dispatch('binding', binding);
    }

    function onIcon(e: any) {
        binding = e.detail;
        dispatch('binding', binding);
    }

    function getBindingLabel() {
        if(binding === undefined) {
            return 'Select binding';
        }

        if (typeof binding === 'object') {
            if (bindingObject !== undefined && bindingState !== undefined) {
                return `${bindingObject.label} - ${bindingState.label}`;
            }

            return 'Invalid binding';
        }

        return 'Unknown';
    }

    function selectBinding(item: WidgetState) {
        if (item === undefined) {
            return;
        }

        const b: WidgetStateBinding = {
            objectId: modalObjectId!,
            stateId: modalStateId!
        };

        binding = b;
        dispatch('binding', b);

        modal.close();
    }

    function getTypeLabel(type: string) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    function getObjectPathLabel(objectId: string) : string {
        const current = context.data[objectId];
        let path = current?.label ?? '';

        if (current?.parentId !== undefined) {
            const parentLabel = getObjectPathLabel(current.parentId);
            
            if (parentLabel) {
                path = parentLabel + ' / ' + path;
            }
        }

        return path;
    }

    function filterModalObjects(objects: { [key: string]: WidgetDataObject }): { [key: string]: { [key: string]: WidgetDataObject } } {
        return Object
            .entries(objects)
            .filter(([_, obj]) => obj.type === modalType)
            .reduce((acc, entry) => {
                const [id, obj] = entry;
                const parentId = obj.parentId;
                
                if (parentId !== undefined) {
                    if (!acc[parentId]) {
                        acc[parentId] = {};
                    }

                    acc[parentId][id] = obj;
                }
                
                return acc;
            }, {} as { [key: string]: { [key: string]: WidgetDataObject } });
    }

    function filterModalStates(obj: WidgetDataObject): [string, WidgetState][] {
        return Object.entries(obj.states).filter(([_, state]) => state.type === state.type);
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">{state.label}</span>
    </div>
    <div class="join flex items-center">
        <select class="select shrink join-item" bind:value={stateMode}>
            <option value="static">{state.type}</option>
            <option value="binding">{'${var}'}</option>
        </select>

        {#if stateMode === 'static'}
            {#if state.type === 'string'}    
                <input type="text" class="input grow join-item" value={binding ?? ''} on:input={e => onString(e)} placeholder="Value"/>
            {:else if state.type === 'number'}
                <input type="number" class="input grow join-item" value={binding ?? ''} on:input={e => onNumber(e)} placeholder="Value"/>
            {:else if state.type === 'boolean'}
                <input type="checkbox" class="toggle toggle-primary grow join-item" checked={binding === true} on:click={e => onBoolean()} />
            {:else if state.type === 'enum'}
                <select class="select grow join-item" value={binding} on:input={e => onEnum(e)}>
                    {#each Object.keys(state.enums ?? {}) as key}
                        <option value={key}>{(state.enums ?? {})[key]}</option>
                    {/each}
                </select>
            {:else if state.type === 'icon'}
                <IconPicker hideLabel iconId={binding} on:iconId={e => onIcon(e)} />
            {/if}
        {:else if stateMode === 'binding'}
            <button class="btn btn-neutral grow join-item" on:click={() => modal.showModal()}>
                {getBindingLabel()}
            </button>
        {/if}
    </div>

    {#if stateMode === 'binding'}
        <div class="label whitespace-nowrap overflow-ellipsis">
            <span class="label-text"></span>
            <span class="label-text-alt">{value ?? ''}</span>
        </div>
    {/if}
</label>

<dialog bind:this={modal} class="modal">
    <div class="modal-box flex flex-col">
        <div class="flex-shrink-0 mb-2">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <Icon data={mdiClose} />
                </button>
            </form>
        </div>
        <div class="flex-grow overflow-auto">
            <ul class="steps w-full mb-4">
                <li class="step step-primary">
                    {modalType !== undefined ? getTypeLabel(modalType) : 'Select type'}
                </li>
                <li class="step" class:step-primary={modalObject !== undefined}>
                    {modalType !== undefined && modalObject === undefined ? 'Select object' : ''}
                    {modalObject !== undefined ? modalObject.label : ''}
                </li>
                <li class="step" class:step-primary={modalState !== undefined}>
                    {modalObject !== undefined && modalState === undefined ? 'Select state' : ''}
                    {modalState !== undefined ? modalState.label : ''}
                </li>
            </ul>

            {#if modalType === undefined}
                <div class="flex flex-col">
                    {#each modalTypes as type}
                        <button class="btn btn-ghost" on:click={() => { modalType = type; modalObject = undefined; }}>{getTypeLabel(type)}</button>
                    {/each}
                </div>
            {:else if modalType !== undefined && modalObject === undefined}
                <VirtualList items={Object.entries(modalObjects)} height="50vh" let:item={parentGroup}>
                    {#each Object.entries(parentGroup[1]) as item}
                        <button class="btn btn-ghost w-full" on:click={() => { modalObjectId = item[0]; modalObject = item[1]; modalState = undefined; }}>
                            <h3 class="w-full flex justify-start">
                                {getObjectPathLabel(item[0])}
                            </h3>
                            {#if item[1].description}
                                <span>{item[1].description}</span>
                            {/if}
                        </button>
                    {/each}
                </VirtualList>
            {:else if modalObject !== undefined && modalState === undefined}
                <VirtualList items={modalStates} height="50vh" let:item>
                    <button class="btn btn-ghost w-full" on:click={() => { modalStateId = item[0]; selectBinding(item); }}>
                        <h3 class="w-full flex justify-start">
                            {modalObject.label} - {item[1].label}
                        </h3>
                        {#if item[1].description}
                            <span>{item[1].description}</span>
                        {/if}
                    </button>
                </VirtualList>
            {/if}
        </div>
    </div>
</dialog>