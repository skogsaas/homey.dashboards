import { v4 as uuid } from 'uuid';
import { mdiPencilBox } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import CanvasEditor from './CanvasEditor.svelte';
import CanvasWidget from './CanvasWidget.svelte';

const info: WidgetInfo = {
    type: 'canvas', 
    label: 'Canvas',
    icon: mdiPencilBox,
    category: 'layout',
    widget: CanvasWidget, 
    editor: CanvasEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'canvas', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;