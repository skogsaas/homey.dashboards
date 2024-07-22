import { v4 as uuid } from 'uuid';
import { mdiViewColumnOutline } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import SectionsEditor from './SectionsEditor.svelte';
import SectionsWidget from './SectionsWidget.svelte';

const info: WidgetInfo = {
    type: 'sections', 
    label: 'Section layout',
    icon: mdiViewColumnOutline,
    category: 'layout',
    widget: SectionsWidget, 
    editor: SectionsEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'sections', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;