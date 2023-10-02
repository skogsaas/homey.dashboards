<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { dashboards as homeyDashboards } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';

    import type DashboardLinkSettings from "./DashboardLinkSettings";

    import Select from "stwui/select";
    import IconPicker from '$lib/components/IconPicker.svelte';

    export let settings: DashboardLinkSettings;

    const dispatch = createEventDispatcher();

    interface Option {
        value: string;
        label: string;
    }

    let size: Option;
    let dashboard: Option | undefined;
    let iconId: string |undefined;

    const sizes = [
        { value: '', label: 'Text'},
        ...[...Array(6).keys()].map(key => ({ value: '' + (key + 1), label: '' + (key + 1) }))
    ];

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards })
        .map(d => ({ value: d.id, label: d.title }));

    $: onSettings(settings);
    $: onDashboard(dashboard);
    $: onSize(size);
    $: onIcon(iconId);

    function onSettings(s: DashboardLinkSettings) {
        dashboard = dashboards.find(d => d.value === settings.dashboardId);
        size = sizes.find(s => s.value === (settings.size ?? ''))!;
        iconId = settings.iconId;
    }

    function onDashboard(option: Option | undefined) {
        if(option === undefined || option.value === settings.dashboardId) {
            return;
        }

        dispatch('settings', { ...settings, dashboardId: option.value });
    }

    function onSize(option: Option | undefined) {
        if(option === undefined || Number(option.value) === settings.size) {
            return;
        }

        dispatch('settings', { ...settings, size: Number(option.value) });
    }

    function onIcon(id: string | undefined) {
        if(id === settings.iconId) {
            return;
        }

        dispatch('settings', { ...settings, iconId: id });
    }
</script>

<Select 
    bind:value={dashboard} 
    placeholder="Dashboard"
    name="dashboard"
>
    <Select.Options slot="options">
        {#each dashboards as option}
            <Select.Options.Option {option} />
        {/each}
    </Select.Options>
</Select>

<Select 
    bind:value={size} 
    placeholder="Font size"
    name="size"
    class="mt-2"
>
    <Select.Options slot="options">
        {#each sizes as option}
            <Select.Options.Option {option} />
        {/each}
    </Select.Options>
</Select>

<div class="mt-2">
    <IconPicker bind:iconId={iconId} />
</div>