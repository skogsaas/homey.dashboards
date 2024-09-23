<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { v4 as uuid } from 'uuid';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { TemplateSettings_v1, TemplateSettingsArgument_v1 } from './TemplateSettings';

    import Widget from '$lib/widgets/Widget.svelte';

    import { templates } from '$lib/stores/homey';
    import type { Template_v1 } from '$lib/types/Store';
    
    export let context: WidgetContext;
    export let settings: TemplateSettings_v1;

    const dispatch = createEventDispatcher();

    let template: Template_v1;
    let rendered: WidgetSettings_v1;
    let templateContext: WidgetContext;

    $: template = $templates[settings.templateId];
    $: rendered = transform(template.root, settings);
    $: templateContext = { ...context, editable: false };
    
    function transform(obj: any, _settings: TemplateSettings_v1) : any {
        if(obj === undefined) return undefined;

        if(Array.isArray(obj)) {
            return (obj as any[]).map(a => transform(a, _settings));
        } else if(typeof obj === 'object') {
            const copy = { ...obj };

            if(isWidget(copy)) {
                // Replace the ID of all sub widgets, as multiple instances of the sub widgets might collide if 
                // they have the same IDs.
                copy.id = uuid();

                if(copy.type === 'template') {
                    // Stop recursion if a template widget is detected. Instead only populate/replace template 
                    // arguments with arguments from this template.

                    (copy as TemplateSettings_v1).arguments = (copy as TemplateSettings_v1).arguments.map(a => ({
                        argId: a.argId,
                        value: transform(a.value, _settings)
                    }));

                    return copy;
                }
            }

            Object.keys(copy).forEach(key => copy[key] = transform(copy[key], _settings));

            return copy;
        } else if(typeof obj === 'string') {
            let copy = obj as string;

            // Replace any template arguments being used.
            const variableRegex = /\$\{([^}]+)\.([^}]+)\}/g;
            const matches: string[][] = [...copy.matchAll(variableRegex)];

            for(const match of matches) {
                const fullMatch = match[0];
                const slug = match[1];
                const argId = match[2];

                if(slug !== 'template') continue;

                const templateArg = (template.arguments ?? []).find(a => a.id === argId);
                const settingsArg = (_settings.arguments ?? []).find(a => a.argId === argId);

                if(templateArg !== undefined) {
                    const argValue = settingsArg?.value ?? templateArg.default;

                    // If the template argument type is `number` or `boolean`, the entire value should be converted 
                    // to the correct type.
                    if(matches.length === 0 && (templateArg.type === 'number' || templateArg.type === 'boolean')) {
                        return argValue;
                    } else {
                        copy = copy.replaceAll(fullMatch, argValue);
                    }
                }
            }

            return copy;
        } else {
            return obj;
        }
    }

    function isWidget(element: any) : boolean {
        return Object.hasOwn(element, 'id') &&
            Object.hasOwn(element, 'type') &&
            Object.hasOwn(element, 'version');
    }
</script>

<Widget context={templateContext} settings={rendered} />