<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    
    import { dashboards as homeyDashboards } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import Icon from './Icon.svelte';
    import { getIcon } from './icons/utils';

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards });
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
                            <button class="btn btn-ghost w-full" on:click={() => goto(base + '/board/?id=' + dashboard.id)}>
                                <Icon data={getIcon(dashboard.iconId ?? 'view-dashboard')} />
                                {dashboard.title}
                                <span class="mx-auto"></span>
                            </button>

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