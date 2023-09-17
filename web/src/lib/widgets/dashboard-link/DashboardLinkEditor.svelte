<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { dashboards as homeyDashboards } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';

    import type DashboardLinkSettings from "./DashboardLinkSettings";

    import Select from "stwui/select";

    export let settings: DashboardLinkSettings;

    const dispatch = createEventDispatcher();

    interface Option {
        value: string;
        label: string;
    }

    let size: Option;
    let dashboard: Option | undefined;

    const sizes = [
        { value: '', label: 'Text'},
        ...[...Array(6).keys()].map(key => ({ value: '' + (key + 1), label: '' + (key + 1) }))
    ];

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards })
        .map(d => ({ value: d.id, label: d.title }));

    $: onDashboard(dashboard);
    $: onSize(size);

    onMount(() => {
        dashboard = dashboards.find(d => d.value === settings.dashboardId);
        size = sizes.find(s => s.value === (settings.size ?? ''))!;
    });

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
</script>

<div style="margin-top: 20px">
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
    >
        <Select.Options slot="options">
            {#each sizes as option}
                <Select.Options.Option {option} />
            {/each}
        </Select.Options>
    </Select>
</div>