import { v4 as uuid } from 'uuid';
import { mdiPostageStamp } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import TemplateEditor from './TemplateEditor.svelte';
import TemplateWidget from './TemplateWidget.svelte';

const info: WidgetInfo = {
    type: 'template', 
    label: 'Template',
    icon: mdiPostageStamp,
    category: 'logic',
    widget: TemplateWidget, 
    editor: TemplateEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'template', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;