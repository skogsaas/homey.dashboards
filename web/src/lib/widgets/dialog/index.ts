import { v4 as uuid } from 'uuid';
import { mdiApplication } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import DialogEditor from './DialogEditor.svelte';
import DialogWidget from './DialogWidget.svelte';

const info: WidgetInfo = {
    type: 'dialog', 
    label: 'Dialog',
    icon: mdiApplication,
    category: 'component',
    widget: DialogWidget, 
    editor: DialogEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'dialog', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;