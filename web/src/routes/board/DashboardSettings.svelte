<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import DashboardEditor from '$lib/widgets/DashboardEditor.svelte';

    import type { Dashboard_v2 } from "$lib/types/Dashboard";
    import type { WidgetBreadcrumb, WidgetSettings_v1 } from "$lib/types/Widgets";
    
    import { findEditor, findInfo } from "$lib/widgets";

    export let dashboard: Dashboard_v2 | undefined;
    export let breadcrumbs: WidgetBreadcrumb[];
    export let breadcrumb: WidgetBreadcrumb | undefined;

    function update(updated: WidgetSettings_v1) {
        breadcrumb!.update(updated);
    }
</script>

<div class="w-full h-full p-2">
    {#if breadcrumbs.length > 0}
        <div class="text-sm breadcrumbs">
            <ul>
                {#each breadcrumbs as b}
                    <li>
                        <a on:click={() => breadcrumb = b}>
                            <Icon data={findInfo(b.settings.type)?.icon} />
                            {findInfo(b.settings.type)?.label}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
        <div class="divider" />
    {/if}
        
    {#if breadcrumb !== undefined}
        <svelte:component 
            this={findEditor(breadcrumb.settings.type)}
            settings={breadcrumb.settings}
            on:settings={e => update(e.detail)}
        />
    {:else if dashboard !== undefined}
        <DashboardEditor settings={dashboard} />
    {/if}
</div>