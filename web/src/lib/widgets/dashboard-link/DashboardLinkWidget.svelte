<script lang="ts">
    import { base } from '$app/paths';
    import { editing } from '$lib/stores/editing';
    import { dashboards as homeyDashboards } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';

    import Icon from '$lib/components/Icon.svelte'

    import type DashboardLinkSettings from './DashboardLinkSettings';
    import { getIcon } from '$lib/components/icons/utils';
    import type { WidgetContext } from '$lib/types/Widgets';

    export let context: WidgetContext;
    export let settings: DashboardLinkSettings;

    $: dashboardId = settings?.dashboardId;
    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    $: dashboard = dashboardId !== undefined ? dashboards[dashboardId] : undefined;
    $: size = settings?.size;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if dashboardId === undefined}
    <span>Dashboard not configured</span>
{:else}
    <div class="w-full h-full flex justify-center items-center" on:click={e => { if(!$editing) { e.stopPropagation(); } }}>
        {#if settings.iconId !== undefined}
            <Icon data={getIcon(settings.iconId)} class="mr-1" />
        {/if}

        {#if dashboard !== undefined}
            {#if $editing}
                {#if size == 1}
                    <h1 class="text-5xl no-margin cursor-pointer">{dashboard.title}</h1>
                {:else if size == 2}
                    <h2 class="text-4xl no-margin cursor-pointer">{dashboard.title}</h2>
                {:else if size == 3}
                    <h3 class="text-3xl no-margin cursor-pointer">{dashboard.title}</h3>
                {:else if size == 4}
                    <h4 class="text-2xl no-margin cursor-pointer">{dashboard.title}</h4>
                {:else if size == 5}
                    <h5 class="text-xl no-margin cursor-pointer">{dashboard.title}</h5>
                {:else if size == 6}
                    <h6 class="text-lg no-margin cursor-pointer">{dashboard.title}</h6>
                {:else}
                    <div class="cursor-pointer">{dashboard.title}</div>
                {/if}
            {:else}
                {#if size == 1}
                    <h1 class="text-5xl no-margin"><a href={base + '/board?id=' + dashboard.id}>{dashboard.title}</a></h1>
                {:else if size == 2}
                    <h2 class="text-4xl no-margin"><a href={base + '/board?id=' + dashboard.id}>{dashboard.title}</a></h2>
                {:else if size == 3}
                    <h3 class="text-3xl no-margin"><a href={base + '/board?id=' + dashboard.id}>{dashboard.title}</a></h3>
                {:else if size == 4}
                    <h4 class="text-2xl no-margin"><a href={base + '/board?id=' + dashboard.id}>{dashboard.title}</a></h4>
                {:else if size == 5}
                    <h5 class="text-xl no-margin"><a href={base + '/board?id=' + dashboard.id}>{dashboard.title}</a></h5>
                {:else if size == 6}
                    <h6 class="text-lg no-margin"><a href={base + '/board?id=' + dashboard.id}>{dashboard.title}</a></h6>
                {:else}
                    <a href={base + '/board?id=' + dashboard.id}>{dashboard.title}</a>
                {/if}
            {/if}
        {:else}
            <span>Dashboard not found</span>
        {/if}
    </div>
{/if}