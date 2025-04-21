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

<div role="tablist" class="tabs tabs-bordered tabs-lg">
    <input type="radio" name="tabs" role="tab" class="tab" aria-label="Settings" checked={true} />
    <div role="tabpanel" class="tab-content pt-2">
        <TextPicker bind:value={title} label="Title" placeholder="Title" />

        <IconPicker bind:iconId={iconId} />

        <div class="alert">
            <span class="text-error">Danger!</span>
            <input type="checkbox" class="checkbox checkbox-error" bind:checked={enableDelete} />
            <button class="btn btn-error" disabled={!enableDelete} on:click={e => deleteDashboard()}>Delete dashboard</button>
        </div>
    </div>

    <input type="radio" name="tabs" role="tab" class="tab" aria-label="JSON" />
    <div role="tabpanel" class="tab-content pt-2">
        <textarea
            placeholder="JSON"
            class="textarea textarea-bordered w-full max-w-xs h-max"
            value={JSON.stringify(settings)}
            rows="10"
        ></textarea>
    </div>
</div>