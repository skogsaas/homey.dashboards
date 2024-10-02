import { v4 as uuid } from 'uuid';
import { mdiMenu } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import ListEditor from './ListEditor.svelte';
import ListWidget from './ListWidget.svelte';

const info: WidgetInfo = {
    type: 'list', 
    label: 'List',
    icon: mdiMenu,
    category: 'layout',
    widget: ListWidget, 
    editor: ListEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'list', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;