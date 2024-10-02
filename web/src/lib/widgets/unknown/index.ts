import { v4 as uuid } from 'uuid';
import { mdiHeadQuestion } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import UnknownEditor from './UnknownEditor.svelte';
import UnknownWidget from './UnknownWidget.svelte';

const info: WidgetInfo = {
    type: 'unknown', 
    label: 'Unknown',
    icon: mdiHeadQuestion,
    widget: UnknownWidget, 
    editor: UnknownEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'unknown', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;