import { v4 as uuid } from 'uuid';
import { mdiPlay } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import FlowEditor from './FlowEditor.svelte';
import FlowWidget from './FlowWidget.svelte';

const info: WidgetInfo = {
    type: 'flow', 
    label: 'Flow',
    icon: mdiPlay,
    category: 'component',
    widget: FlowWidget, 
    editor: FlowEditor,
    scopes: [
        { oneOf: ['homey', 'homey.flow', 'homey.flow.start'] }
    ],
    create: () => ({ id: uuid(), type: 'flow', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;