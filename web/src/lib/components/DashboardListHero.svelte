<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { deleteDashboard as apiDelete } from '$lib/api/webhook';
    import { alerts } from '$lib/stores/alerting';
    import { favorite } from '$lib/stores/favorite';
    
    import { homey, dashboards as homeyDashboards, stores } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import type { Dashboard_v2 } from '$lib/types/Store';
    import Icon from './Icon.svelte';
    import { mdiDotsVertical, mdiStar, mdiTrashCan } from './icons';
    import { getIcon } from './icons/utils';

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards });

    function favoriteDashboard(dashboard: Dashboard_v2) {
        favorite.set(dashboard.id);
    }

    async function deleteDashboard(dashboard: Dashboard_v2) {
        const storeId = Object.values($stores).find(store => store.dashboards.some(dash => dash?.id === dashboard?.id))?.id;

        if (!storeId) {
            alerts.error('Error', 'Could not find the store for the dashboard', 5000);
            return;
        }
        
        if (confirm(`Are you sure you want to delete '${dashboard.title}' ?`)) {
            await apiDelete($homey!.id, storeId, dashboard);
            alerts.success('Deleted!', 'The dashboard was deleted.', 5000);
        }
    }
</script>

<div class="hero bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left">
            <slot></slot>
        </div>
        <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            {#if dashboards !== undefined && dashboards.length > 0}
                <div class="card w-96 bg-base-100 shadow-xl">
                    <div class="card-body">
                        {#each dashboards as dashboard, i}
                            <div class="flex flex-row items-center">
                                <button class="btn btn-ghost flex-1 flex justify-start" on:click={() => goto(base + '/board/?id=' + dashboard.id)}>
                                    <Icon data={getIcon(dashboard.iconId ?? 'view-dashboard')} />
                                    {dashboard.title}
                                </button>
                                {#if $favorite === dashboard.id}
                                    <Icon data={mdiStar} />
                                {/if}

                                <details class="dropdown">
                                    <summary class="btn btn-ghost">
                                        <Icon data={mdiDotsVertical} />
                                    </summary>
                                    <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li><a on:click={e => favoriteDashboard(dashboard)}><Icon data={mdiStar} />Favorite</a></li>
                                        <li><a class="text-error" on:click={e => deleteDashboard(dashboard)}><Icon data={mdiTrashCan} />Delete</a></li>
                                    </ul>
                                </details>
                                
                            </div>
                            
                            {#if i < (dashboards.length - 1)}
                                <div class="divider divider-neutral my-1"></div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="text-center py-2">
                    <span class="text-6xl p-4 block">🐳</span>
                    <p>Here's a whale to look at, because you have no dashboards yet anyway 🤷</p>
                </div>
            {/if}
        </div>
    </div>
</div>