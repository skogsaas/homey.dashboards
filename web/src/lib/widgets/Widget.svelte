<script lang="ts">
    import { findLabel, findWidget } from '$lib/widgets';
    import type { WidgetBreadcrumb, WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import { dragHandle } from 'svelte-dnd-action';
    import Icon from '$lib/components/Icon.svelte';
    import { mdiContentCopy, mdiContentCut, mdiCursorMove, mdiDotsVertical, mdiDrag, mdiTrashCan } from '$lib/components/icons';
    import type { TemplateSettings_v1 } from './template/TemplateSettings';
    import { templates } from '$lib/stores/homey';
    import { copying, selection } from '$lib/stores/editing';

    export let settings: WidgetSettings_v1;
    export let context: WidgetContext;

    let dropdownOpen = false;

    $: selected = settings.id === $selection;
    $: childContext = { ...context, select };

    function select(breadcrumbs: WidgetBreadcrumb[]) {
        context.select([{ settings, context }, ...breadcrumbs ]);
    }

    function getLabel() {
        if(settings.type === 'template') {
            return $templates[(settings as TemplateSettings_v1).templateId]?.title ?? findLabel(settings.type);
        }

        return findLabel(settings.type);
    }

    function onCut() {
        dropdownOpen = false;

        copying.set({
            operation: 'cut',
            settings,
            source: context
        });
    }

    function onCopy() {
        dropdownOpen = false;

        copying.set({
            operation: 'copy',
            settings,
            source: context
        });
    }

    function onDelete() {
        dropdownOpen = false;
        
        if(context.remove === undefined) return;

        context.select([]); // Select the parent widget before removing child.

        context.remove(settings.id);
    }
</script>

{#if context.editable}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-missing-attribute -->
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div 
        on:click|stopPropagation={() => select([])}
        class="outline-1 outline-offset-8 outline-primary min-h-6 rounded-md"
        class:outline-dashed={selected}
        class:pt-1={!selected}
    >
        {#if selected}
            <div class="flex w-full p-1 mb-2 pb-2 border border-t-0 border-x-0 border-dashed border-primary">
                <div use:dragHandle class="cursor-grab mr-2">
                    <Icon data={mdiCursorMove} size={5} />
                </div>
                
                {getLabel()}

                <details class="dropdown ml-auto dropdown-end" bind:open={dropdownOpen}>
                    <summary class="btn btn-circle btn-xs" tabindex="0">
                        <Icon data={mdiDotsVertical} size={4} />
                    </summary>

                    <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        <li on:click={() => onCut()}><a><Icon data={mdiContentCut} size={4} />Cut</a></li>
                        <li on:click={() => onCopy()}><a><Icon data={mdiContentCopy} size={4} />Copy</a></li>
                        <li on:click={() => onDelete()}><a class="text-error"><Icon data={mdiTrashCan} size={4} />Delete</a></li>
                    </ul>
                </details>
            </div>
        {:else}
            <div class="flex w-full font-thin text-[10px]">
                - {getLabel()}
            </div>
        {/if}
        
        <svelte:component 
            this={findWidget(settings.type)}
            {settings}
            context={childContext}
        />
    </div>
{:else}
    <svelte:component 
        this={findWidget(settings.type)}
        {settings}
        context={childContext}
    />
{/if}