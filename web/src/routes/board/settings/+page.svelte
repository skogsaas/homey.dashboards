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
    import { Input, Button, Progress, TextArea } from 'stwui';
    
    // Types
    import type Dashboard from '$lib/types/Dashboard';
    
    import { webhookId, webhookUrl } from '$lib/constants';

    let dashboard: Dashboard | undefined;
    let savingDashboard: boolean = false;

    let deleteDashboardOpen: boolean = false;

    let title: string = '';
    let backgroundImage: string | undefined;

    let changes: boolean;

    $: dashboards = { ...$homeyDashboards, ...$localDashboards };
    $: dashboardId = $page.url.searchParams.get('id');
    $: resolvedDashboard = dashboardId !== null ? dashboards[dashboardId] : undefined;

    $: onDashboard(resolvedDashboard);
    $: changes = hasChanges(title, backgroundImage);

    function onDashboard(d: Dashboard | undefined) {
        if(d !== undefined) {
            currentDashboard.set(d);
            dashboard = d;

            title = dashboard.title;
            backgroundImage = dashboard.backgroundImage;
        }
    }

    function hasChanges(_title: string, _backgroundImage: string | undefined) {
        return _title !== dashboard?.title || _backgroundImage !== dashboard?.backgroundImage;
    }

    async function saveDashboard() {
        if(dashboard !== undefined) {
            savingDashboard = true;

            if(dashboard.source === 'localstorage') {
                const d = { ...dashboard, title, backgroundImage };
                localDashboards.update(d);
            } else if(dashboard.source === 'homey') {
                const settings = { items: dashboard.items, backgroundImage };
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

            <Button type="danger" on:click={() => deleteDashboardOpen = true}>Delete</Button>

            {#if savingDashboard}
                <Progress size="xs" indeterminate value={0} />
            {/if}
        {:else}
            <p>If you want to edit the name of this dashboard, rename the dashboard in the Homey app.</p>
        {/if}

        <Input name="backgroundImage" bind:value={backgroundImage} placeholder="Background image url" />

        <p class="mt-4">Raw settings for this dashboard</p>
        <TextArea  
            value={JSON.stringify(dashboard, null, 2)} 
            name="json"
            placeholder="settings"
            readonly
        />

        <Button class="mt-4" on:click={() => saveDashboard()} disabled={!changes}>Save</Button>
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