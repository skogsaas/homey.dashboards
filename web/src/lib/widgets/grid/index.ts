import { v4 as uuid } from 'uuid';
import { mdiTableColumn } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import GridEditor from './GridEditor.svelte';
import GridWidget from './GridWidget.svelte';

const info: WidgetInfo = {
    type: 'grid', 
    label: 'Grid',
    icon: mdiTableColumn,
    category: 'layout',
    widget: GridWidget, 
    editor: GridEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'grid', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;