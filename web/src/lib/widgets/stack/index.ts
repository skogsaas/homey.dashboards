import { v4 as uuid } from 'uuid';
import { mdiMenu, mdiTableColumn } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import StackEditor from './StackEditor.svelte';
import StackWidget from './StackWidget.svelte';

const info: WidgetInfo = {
    type: 'stack', 
    label: 'Stack',
    icon: mdiMenu,
    category: 'layout',
    widget: StackWidget, 
    editor: StackEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'stack', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;