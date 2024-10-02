<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { dashboards as homeyDashboards } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';

    import type DashboardLinkSettings from "./DashboardLinkSettings";

    import IconPicker from '$lib/components/IconPicker.svelte';

    export let settings: DashboardLinkSettings;

    const dispatch = createEventDispatcher();

    let size: number | undefined;
    let dashboardId: string | undefined;
    let iconId: string |undefined;

    const sizes = [
        { value: undefined, label: 'Text'},
        ...[...Array(6).keys()].map(key => ({ value: (key + 1), label: '' + (key + 1) }))
    ];

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards })
        .map(d => ({ value: d.id, label: d.title }));

    $: onSettings(settings);
    $: onChanges(dashboardId, size, iconId);

    function onSettings(s: DashboardLinkSettings) {
        dashboardId = settings.dashboardId;
        size = settings.size;
        iconId = settings.iconId;
    }

    function onChanges(
        _dashboardId: string | undefined,
        _size: number | undefined,
        _iconId: string | undefined
    ) {
        if(
            _dashboardId !== settings.dashboardId || 
            _size !== settings.size ||
            _iconId !== settings.iconId
        ) {
            dispatch('settings', { ...settings, dashboardId: _dashboardId, size: _size, iconId: _iconId });
        }
    }

</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Dashboard</span>
    </div>
    <select class="select w-full" bind:value={dashboardId} placeholder="Dashboard">
        {#if dashboardId === undefined}
            <option selected></option>
        {/if}
    
        {#each dashboards as option}
            <option value={option.value} selected={option.value === dashboardId}>{option.label}</option>
        {/each}
    </select>
</label>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Font size</span>
    </div>
    <select class="select w-full" bind:value={size} placeholder="Font size">    
        {#each sizes as option}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</label>

<IconPicker bind:iconId={iconId} />