<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";

    import type { Template_v1 } from "$lib/types/Template";
    import type { WidgetBreadcrumb, WidgetSettings_v1 } from "$lib/types/Widgets";
    
    import { findEditor, findInfo } from "$lib/widgets";
    import { createEventDispatcher } from "svelte";
    import TemplateEditor from "./TemplateEditor.svelte";
    
    export let template: Template_v1 | undefined;
    export let breadcrumbs: WidgetBreadcrumb[];
    export let breadcrumb: WidgetBreadcrumb | undefined;

    const dispatch = createEventDispatcher();

    function updateWidget(updated: WidgetSettings_v1) {
        breadcrumb!.update(updated);
    }

    function updateTemplate(_template: Template_v1) {
        template = _template;
        dispatch('template', _template);
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
            on:settings={e => updateWidget(e.detail)}
        />
    {:else if template !== undefined}
        <TemplateEditor template={template} on:template={e => updateTemplate(e.detail)} />
    {/if}
</div>