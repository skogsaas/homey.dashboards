<script lang="ts">
    import type { Dashboard_v2 } from '$lib/types/Dashboard';
    import { createEventDispatcher } from 'svelte';

    import IconPicker from '$lib/components/IconPicker.svelte';

    export let settings: Dashboard_v2;

    const dispatch = createEventDispatcher();

    let iconId: string | undefined;

    $: onSettings(settings);
    $: onChange(iconId);

    function onSettings(s: Dashboard_v2) {
        iconId = s.iconId;
    }

    function onChange(
        _iconId: string | undefined
    ) {
        if(
            settings.iconId !== _iconId
        ) {
            const s = { 
                ...settings, 
                iconId: _iconId
            };

            dispatch('settings', s);
        }
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Icon</span>
    </div>
    <IconPicker bind:iconId={iconId} />
</label>