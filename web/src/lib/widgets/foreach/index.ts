import { v4 as uuid } from 'uuid';
import { mdiCardMultiple } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import ForeachEditor from './ForeachEditor.svelte';
import ForeachWidget from './ForeachWidget.svelte';

const info: WidgetInfo = {
    type: 'foreach', 
    label: 'Foreach',
    icon: mdiCardMultiple,
    category: 'logic',
    widget: ForeachWidget, 
    editor: ForeachEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'foreach', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;