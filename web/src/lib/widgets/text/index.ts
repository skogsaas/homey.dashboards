import { v4 as uuid } from 'uuid';
import { mdiTextBoxEdit } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import TextEditor from './TextEditor.svelte';
import TextWidget from './TextWidget.svelte';

const info: WidgetInfo = {
    type: 'text', 
    label: 'Text',
    icon: mdiTextBoxEdit,
    category: 'component',
    widget: TextWidget, 
    editor: TextEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'text', version: 1 }),
    migration: (e: WidgetSettings_v1) => e,
    deprecated: true
};

export default info;