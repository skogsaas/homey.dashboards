<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { templates as homeyTemplates, templatesLoading, homey } from '$lib/stores/homey';
    import { templates as localtemplates } from '$lib/stores/localstorage';
    import { editing } from '$lib/stores/dashboard';

    // UI elements
    import TemplateEditor from './TemplateEditor.svelte';
    import WidgetEditor from '$lib/components/WidgetEditor.svelte';

    // Icons
    import { mdiPostageStamp } from '$lib/components/icons';

    // Types
    import type { WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { TemplateMap, Template_v1 } from '$lib/types/Template';

    // Utils
    import { v4 as uuid } from 'uuid';
    
    let templates: TemplateMap;
    let template: Template_v1 | undefined;
    let root: WidgetSettings_v1 | undefined;

    $: templateId = $page.url.searchParams.get('id');
    $: templates = { ...$homeyTemplates, ...$localtemplates };
    $: onTemplateId(templates, templateId);

    onMount(async () => {
        if($homey === undefined) { // Not logged in
            await goto(base + '/');
        }
    });

    function onTemplateId(_templates: TemplateMap, _templateId: string | null) {
        if(template === undefined) {
            template = templates[_templateId ?? ''];
            root = template?.root;
        }
    }

    function onSave() {
        if(template !== undefined) {
            // TODO: Save to multiple locations
            localtemplates.update(template);
        }
    }

    function onRoot(_root: WidgetSettings_v1 | undefined) {
        if(template === undefined) return;

        root = _root;
        template = { ...template, root };
    }

    function create() {
        template = {
            id: uuid(),
            title: 'New template',
            root: undefined,
            arguments: []
        }

        root = template.root;
        editing.set(true);
    }
</script>

{#if $homey === undefined || $templatesLoading}
    <div class="flex justify-center">
        <div class="card w-full max-w-md mt-8 bg-base-300">
            <div class="card-body">
                <h1 class="card-title">🤖 Bzzt!</h1>
                <p class="py-1">Loading template...</p>
                <div class="w-full mt-8 text-center">
                    <span class="loading loading-infinity w-40 text-primary"></span>
                </div>
            </div>
        </div>
    </div>
{:else if $homey !== undefined}
    {#if template !== undefined}
        <WidgetEditor
            title={template?.title ?? 'Template title'}
            settingsTitle="Template"
            settingsIcon={mdiPostageStamp}
            root={root}
            on:root={e => onRoot(e.detail)}
            on:save={e => onSave()}
        >
            <TemplateEditor bind:template={template} />
        </WidgetEditor>
    {:else}
        <div class="flex justify-center">
            <div class="card w-full max-w-md mt-8 bg-base-300">
                <div class="card-body">
                    {#if templateId !== null}
                        <h1 class="card-title">🚯 Error!</h1>
                        <p class="py-1">Cannot find the template with id: {templateId}</p>
                        
                        <div class="w-full mt-8 text-center">
                            <span class="text-5xl">🤷</span>
                        </div>
                    {:else}
                        <h1 class="card-title">👋 Hello there!</h1>
                        <p class="py-1">Want to create a new template?</p>
                        
                        <button class="btn" on:click={() => create()}>Let's go! 🧑‍💻</button>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
{/if}
