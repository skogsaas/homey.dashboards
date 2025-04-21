<script lang="ts">
    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { TemplateSettings_v1 } from './TemplateSettings';

    import Widget from '$lib/widgets/Widget.svelte';

    import { templates } from '$lib/stores/homey';
    import type { Template_v1 } from '$lib/types/Store';
    import { transform } from './templateUtils';
    
    export let context: WidgetContext;
    export let settings: TemplateSettings_v1;

    let template: Template_v1;
    let rendered: WidgetSettings_v1;
    let templateContext: WidgetContext;

    $: template = $templates[settings.templateId];
    $: args = (settings.arguments ?? []).reduce((result, current) => { (result as any)[current.argId] = current.value; return result; }, {});
    $: rendered = transform(template.root, args, 'template');
    $: templateContext = { ...context, editable: false };
</script>

<Widget context={templateContext} settings={rendered} />