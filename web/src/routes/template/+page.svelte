<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { templates as homeyTemplates, templatesLoading, homey, stores } from '$lib/stores/homey';
    import { templates as localtemplates } from '$lib/stores/localstorage';
    import { editing } from '$lib/stores/editing';

    // UI elements
    import TemplateEditor from './TemplateEditor.svelte';
    import WidgetEditor from '$lib/components/WidgetEditor.svelte';
    import StoreDialog from '$lib/components/StoreDialog.svelte';
    import TemplateListHero from '$lib/components/TemplateListHero.svelte';

    // Icons
    import { mdiPostageStamp } from '$lib/components/icons';

    // Types
    import type { WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { Template_v1, TemplateMap } from '$lib/types/Store';

    // Utils
    import { v4 as uuid } from 'uuid';
    import { saveTemplate } from '$lib/api/webhook';
    import { alerts } from '$lib/stores/alerting';
    
    let templates: TemplateMap;
    let template: Template_v1 | undefined;
    let root: WidgetSettings_v1 | undefined;

    let storeOpen: boolean = false;

    $: templateId = $page.url.searchParams.get('id');
    $: templates = { ...$homeyTemplates, ...$localtemplates };
    $: onTemplate(templates, templateId);

    onMount(async () => {
        if($homey === undefined) { // Not logged in
            await goto(base + '/');
        }
    });

    function onTemplate(_templates: TemplateMap, _templateId: string | null) {
        const _template = _templates[_templateId ?? ''];

        if(_template !== undefined && (template === undefined || (template !== _template && !$editing))) {
            template = _template;
            root = template?.root;
        }
    }

    async function onSave() {
        if(template !== undefined) {
            const storeId = Object.values($stores).find(store => store.templates.some(t => t.id === templateId))?.id;

            if(storeId !== undefined) {
                try {
                    await saveTemplate($homey!.id, storeId, template);
                    alerts.success('Saved!', 'The template was saved.', 5000);
                } catch(error) {
                    alerts.error('Error!', 'Could not save template: ' + error, 10000)
                }
            } else {
                // This is a new template, need to select a store first.
                storeOpen = true;
            }
        }
    }

    async function onStoreSelect(storeId: string) {
        try {
            await saveTemplate($homey!.id, storeId, template!);
            alerts.success('Saved!', 'The template was saved.', 5000);
        } catch(error) {
            alerts.error('Error!', 'Could not save template: ' + error, 10000)
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

<svelte:head>
  <title>{template !== undefined ? template.title : 'Template'}</title>
</svelte:head>

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
            saveTitle="Save"
            settingsTitle="Template"
            settingsIcon={mdiPostageStamp}
            root={root}
            on:root={e => onRoot(e.detail)}
            on:save={e => onSave()}
        >
            <TemplateEditor bind:template={template} />
        </WidgetEditor>

        <StoreDialog bind:open={storeOpen} on:storeId={e => onStoreSelect(e.detail)} />
    {:else}
        <div class="flex min-h-screen justify-center">
            <TemplateListHero>
                <div class="p-4">
                    {#if templateId !== null}
                        <h1 class="text-5xl font-bold">🤖 Does not compute!</h1>
                        <p class="py-6">
                            Cannot find the template with id: <code>{templateId}</code>
                        </p>
                        
                        <div class="w-full mt-8 text-center">
                            <span class="text-5xl">🤷</span>
                        </div>
                    {:else}
                        <div class="text-center">
                            <h1 class="text-5xl font-bold">👋 Hello there!</h1>
                            <p class="py-6">Want to create a new template?</p>
                            
                            <button class="btn btn-primary" on:click={() => create()}>Let's go! 🧑‍💻</button>
                        </div>
                    {/if}
                </div>
            </TemplateListHero>
        </div>
    {/if}
{/if}
