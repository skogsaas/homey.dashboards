<script lang="ts">
    import type { Dashboard_v2 } from '$lib/types/Store';
    import { createEventDispatcher } from 'svelte';

    import IconPicker from '$lib/components/IconPicker.svelte';
    import TextPicker from '$lib/components/TextPicker.svelte';

    export let settings: Dashboard_v2;

    const dispatch = createEventDispatcher();

    let title: string;
    let iconId: string | undefined;

    let enableDelete = false;

    $: onSettings(settings);
    $: onChange(title, iconId);

    function onSettings(s: Dashboard_v2) {
        title = s.title;
        iconId = s.iconId;
    }

    function onChange(
        _title: string,
        _iconId: string | undefined
    ) {
        if(
            settings.title !== _title ||
            settings.iconId !== _iconId
        ) {
            const s = { 
                ...settings,
                title: _title,
                iconId: _iconId
            };

            dispatch('settings', s);
        }
    }

    function deleteDashboard() {
        dispatch('delete');
    }
</script>

<TextPicker bind:value={title} label="Title" placeholder="Title" />

<IconPicker bind:iconId={iconId} />

<div class="alert">
    <span class="text-error">Danger!</span>
    <input type="checkbox" class="checkbox checkbox-error" bind:checked={enableDelete} />
    <button class="btn btn-error" disabled={!enableDelete} on:click={e => deleteDashboard()}>Delete dashboard</button>
</div>