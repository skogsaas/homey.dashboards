<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { SecuredSettings_v1 } from './SecuredSettings';
    import WidgetSingle from '$lib/components/WidgetSingle.svelte';
    import { sha256 } from 'js-sha256';
    import { mdiClose } from '$lib/components/icons';
    import Icon from '$lib/components/Icon.svelte';
    
    export let settings: SecuredSettings_v1;
    export let context: WidgetContext;

    let item: WidgetSettings_v1 | undefined;
    let locked: boolean = true;
    let mode: 'readonly' | 'blur' | 'hidden' = 'readonly';
    let password: string = '';

    let modal: HTMLDialogElement;

    $: onSettings(settings);
    $: onPassword(password);
    $: readonlyContext = { ...context, readonly: true };

    function onSettings(_settings: SecuredSettings_v1) {
        item = _settings.item;
        mode = _settings.mode || 'readonly';
    }

    function onPassword(_password: string) {
        if (_password.length > 0) {
            const hashed = sha256(_password);
            locked = hashed !== settings.hash;
        } else {
            locked = true;
        }
    }

    function updateItem(_item: WidgetSettings_v1 | undefined) {
        settings = { ...settings, item: _item };

        context.update(settings);
    }
</script>

{#if context.editable}
    <WidgetSingle
        id={settings.id}
        {context}
        {item} 
        {updateItem}
    />
{:else}
    <div class="flex flex-col items-center justify-center relative">
        {#if locked}
            <div class="flex flex-col items-center justify-center z-10" class:absolute={mode !== 'hidden'}>
                <button class="btn btn-primary place-self-center" on:click={() => { modal.show(); }}>Unlock</button>
            </div>

            <dialog bind:this={modal} class="modal">
                <div class="modal-box flex flex-col">
                    <div class="flex-shrink-0 mb-2">
                        <form method="dialog">
                            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                <Icon data={mdiClose} />
                            </button>
                        </form>
                    </div>
                    
                    <input class="input" type="password" bind:value={password} placeholder="Password" />
                </div>
            </dialog>
        {/if}

        {#if mode === 'readonly'}
            <WidgetSingle
                id={settings.id}
                context={!locked ? context : readonlyContext}
                {item} 
                {updateItem}
            />
        {:else if mode === 'blur'}
            <WidgetSingle
                id={settings.id}
                context={!locked ? context : readonlyContext}
                {item} 
                {updateItem}
                class={ locked ? 'blur-lg' : '' }
            />
        {:else if !locked}
            <WidgetSingle
                id={settings.id}
                {context}
                {item} 
                {updateItem}
            />
        {/if}
    </div>
{/if}