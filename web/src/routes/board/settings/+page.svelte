<script lang="ts">
    // Svelte
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { homey, dashboards as homeyDashboards, scopes } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import { dashboard as currentDashboard } from '$lib/stores/dashboard';
    
    // UI components
    import Button, { Icon, Label } from '@smui/button';
    import CircularProgress from '@smui/circular-progress';

    import ConfirmDialog from '$lib/ConfirmDialog.svelte';
    // Types
    import type Dashboard from '$lib/types/Dashboard';
    
    import { webhookId, webhookUrl } from '$lib/constants';
    import Textfield from '@smui/textfield';

    let dashboard: Dashboard | undefined;
    let savingDashboard: boolean = false;

    let deleteDashboardOpen: boolean = false;

    let title: string = '';
    let changes: boolean;

    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    $: dashboardId = $page.url.searchParams.get('id');
    $: resolvedDashboard = dashboardId !== null ? dashboards[dashboardId] : undefined;

    $: onDashboard(resolvedDashboard);
    $: changes = hasChanges(title);

    function onDashboard(d: Dashboard | undefined) {
        if(d !== undefined) {
            currentDashboard.set(d);
            dashboard = d;

            title = dashboard.title;
        }
    }

    function hasChanges(_title: string) {
        return _title !== dashboard?.title;
    }

    async function saveDashboard() {
        if(dashboard !== undefined) {
            savingDashboard = true;

            if(dashboard.source === 'localstorage') {
                const d = { ...dashboard, title };
                localDashboards.update(d);
            } else if(dashboard.source === 'homey') {
                const settings = { items: dashboard.items };
                let success: boolean = false;

                // Send over webhook
                try {
                    const url = webhookUrl + webhookId + '?homey=' + $homey.id + '&operation=save_dashboard&dashboardId=' + dashboard.id;
                    const response = await fetch(url, { method: 'POST', body: JSON.stringify(settings) });

                    if(response.ok) {
                        success = true;
                    }
                } catch(e) {
                }

                // Try accessing the api directly
                if(!success) {
                    if($scopes.includes('homey') || $scopes.includes('homey.app')) {
                        try {
                            const app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
                            
                            if(app !== undefined) {
                                await app.put({ path: '/dashboards/' + dashboard.id, body: settings });
                                success = true;
                            }
                        } catch(e) {
                            // Do nothing
                        }
                    }
                }
            }
        }

        savingDashboard = false;
    }

    async function deleteDashboard() {
        if(dashboard === undefined) {
            return;
        }

        localDashboards.delete(dashboard);
        currentDashboard.set(undefined);

        await goto(base + '/');
    }

</script>

<div class="align-center">
    <div class="content">
        {#if dashboard !== undefined}
            <h1 style="text-align: center">Settings</h1>
            {#if dashboard.source === 'localstorage'}
                <Textfield bind:value={title} style="width: 100%" label="Dashboard name"></Textfield>

                <div class="action-buttons">
                    <Button color='secondary' on:click={() => deleteDashboardOpen = true}>
                        <Icon class="material-icons">delete</Icon>
                        <Label>Delete</Label>
                    </Button>

                    <ConfirmDialog bind:open={deleteDashboardOpen} text="Are you sure you want to delete this dashboard?" on:confirm={async () => deleteDashboard()}/>

                    <Button disabled={!changes} on:click={() => saveDashboard()}>
                        <Label>
                            Save
                            {#if savingDashboard}
                                <CircularProgress style="height: 28px; width: 28px;" indeterminate />
                            {/if}
                        </Label>
                    </Button>
                </div>
            {:else}
                <p>Only local dashboards has settings for now. If you want to edit the name of the Homey device dashboard, use the Homey app.</p>
            {/if}
        {:else}
            <h1>Unable to find dashboard: {dashboardId}</h1>
        {/if}
    </div>
</div>

<style>
    .align-center {
        display: flex;
        width: 100%;
        justify-content: center;
    }

    .content {
        max-width: 600px;
    }

    .action-buttons {
        display: flex;
        width: 100%;
        margin-top: 20px;
        justify-content: space-between;
    }
</style>