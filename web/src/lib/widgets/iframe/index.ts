import { v4 as uuid } from 'uuid';
import { mdiImageFrame } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import IframeEditor from './IframeEditor.svelte';
import IframeWidget from './IframeWidget.svelte';

const info: WidgetInfo = {
    type: 'iframe', 
    label: 'Iframe',
    icon: mdiImageFrame,
    category: 'component',
    widget: IframeWidget, 
    editor: IframeEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'iframe', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;