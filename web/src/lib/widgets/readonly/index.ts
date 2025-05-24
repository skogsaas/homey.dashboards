import { v4 as uuid } from 'uuid';
import { mdiMenu, mdiPencilOff } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import ReadonlyEditor from './ReadonlyEditor.svelte';
import ReadonlyWidget from './ReadonlyWidget.svelte';

const info: WidgetInfo = {
    type: 'readonly', 
    label: 'Readonly',
    icon: mdiPencilOff,
    category: 'logic',
    widget: ReadonlyWidget, 
    editor: ReadonlyEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'readonly', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;