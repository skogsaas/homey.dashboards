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
    import ConfirmDialog from '$lib/ConfirmDialog.svelte';
    
    // Tailwind
    import Input from 'stwui/input';
    import Button from 'stwui/button';
    import Progress from 'stwui/progress';
    import TextArea from "stwui/text-area";

    import tooltip from 'stwui/actions/tooltip'

    // Types
    import type Dashboard from '$lib/types/Dashboard';
    
    import { webhookId, webhookUrl } from '$lib/constants';

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
        currentDashboard.set(undefined!);

        await goto(base + '/');
    }

</script>

<div class="flex flex-col justify-center mx-auto max-w-md">
    {#if dashboard !== undefined}
        <h1 class="text-center pt-8 pb-8">Settings</h1>

        {#if dashboard.source === 'localstorage'}
            <Input name="name" bind:value={title} placeholder="Dashboard name" />

            <div class="flex justify-between mt-4">
                <Button type="danger" on:click={() => deleteDashboardOpen = true}>Delete</Button>
                <Button on:click={() => saveDashboard()} disabled={!changes}>Save</Button>

                {#if savingDashboard}
                    <Progress size="xs" indeterminate value={0} />
                {/if}
            </div>
        {:else}
            <p>If you want to edit the name of this dashboard, rename the dashboard in the Homey app.</p>
        {/if}

        <p class="mt-4">Raw settings for this dashboard:</p>

        <TextArea  
            value={JSON.stringify(dashboard, null, 2)} 
            name="json"
            placeholder="settings"
            readonly
        />
    {:else}
        <h1 class="text-center pt-8 pb-8">Unable to find dashboard: {dashboardId}</h1>
    {/if}
</div>

<ConfirmDialog 
    bind:open={deleteDashboardOpen} 
    text="Are you sure you want to delete this dashboard?" 
    title="Confirm delete"
    confirmText="Delete"
    cancelText="Cancel"
    on:confirm={() => deleteDashboard()} />