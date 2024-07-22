<script lang="ts">
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    // Stores
    import { templates as homeyTemplates, templatesLoading, homey } from '$lib/stores/homey';
    import { templates as localtemplates } from '$lib/stores/localstorage';

    // UI elements
    import TemplateSettings from './TemplateSettings.svelte';
    import Icon from '$lib/components/Icon.svelte'
    import Widget from '$lib/widgets/Widget.svelte';
    import WidgetTypeList from '$lib/components/WidgetTypeList.svelte';

    import StackInfo from '$lib/widgets/stack';

    // Types
    import { v4 as uuid } from 'uuid';
    import type { WidgetBreadcrumb, WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { TemplateMap, Template_v1 } from '$lib/types/Template';

    import { mdiCog, mdiFloppy, mdiMenu, mdiWidgets } from '$lib/components/icons';
    
    let widgetsOpen: boolean = false;
    let settingsOpen: boolean = false;
    
    let breadcrumbs: WidgetBreadcrumb[] = [];
    let breadcrumb: WidgetBreadcrumb | undefined;

    let templates: TemplateMap;
    let template: Template_v1 | undefined;
    let root: WidgetSettings_v1 | undefined;

    let context: WidgetContext;

    $: templateId = $page.url.searchParams.get('id');
    $: templates = { ...$homeyTemplates, ...$localtemplates };
    $: onTemplateId(templates, templateId);

    $: context = { 
        editable: true, 
        readonly: false, 
        breadcrumbs: [],
        select
    };

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

    function save() {
        if(template !== undefined) {
            localtemplates.update(template);
        }
    }

    function create() {
        template = {
            id: uuid(),
            title: 'New template',
            root: StackInfo.create(),
            arguments: []
        }

        root = template.root;
    }

    function select(_breadcrumbs: WidgetBreadcrumb[]) {
        breadcrumbs = _breadcrumbs;

        if(breadcrumbs.length > 0) {
            breadcrumb = breadcrumbs[breadcrumbs.length - 1];
        } else {
            breadcrumb = undefined;
        }
    }
</script>

<div class="w-full h-full">
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
        {#if root !== undefined}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="w-full h-screen flex flex-col relative">
                <!-- Toolbar -->
                <div class="navbar sticky top-0 z-10 bg-base-200 grow-0">
                    <div class="navbar-start">
                        <label for="main-drawer" aria-label="close sidebar" class="btn btn-square btn-ghost">
                            <Icon data={mdiMenu} />
                        </label>
                        
                        <div class="hidden md:block">
                            <button class="btn btn-ghost text-xl">{template?.title}</button>
                        </div>
                    </div>

                    <div class="navbar-center gap-2">
                        <button class="btn btn-square btn-ghost" on:click={() => { widgetsOpen = !widgetsOpen; }} >
                            <Icon data={mdiWidgets} />
                            Widgets
                        </button>

                        <button class="btn btn-square btn-ghost" on:click={() => { settingsOpen = !settingsOpen }} >
                            <Icon data={mdiCog} />
                            Settings
                        </button>
                    </div>

                    <div class="navbar-end">
                        <button class="btn btn-square btn-primary" on:click={() => save()} >
                            <Icon data={mdiFloppy} />
                            Save
                        </button>
                    </div>
                </div>

                <!-- Main content -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="flex justify-center" on:click={() => select([])}>
                    <div class="w-full max-w-md min-h-[50px]">
                        <Widget settings={root} {context} />
                    </div>
                </div>
                
                <!-- Left sidebar -->
                <div class="fixed top-16 left-0 z-10 w-full max-w-xs h-full bg-base-200 transition-transform {!widgetsOpen ? '-translate-x-full' : 'translate-x-0'}">
                    <WidgetTypeList />
                </div>

                <!-- Right sidebar -->
                <div class="fixed top-16 right-0 z-10 w-full max-w-xs h-full bg-base-200 transition-transform {!settingsOpen ? 'translate-x-full' : 'translate-x-0'}">
                    <TemplateSettings bind:template={template} bind:breadcrumbs={breadcrumbs} bind:breadcrumb={breadcrumb} />
                </div>
            </div>
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
</div>
