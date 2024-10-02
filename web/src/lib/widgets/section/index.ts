import { v4 as uuid } from 'uuid';
import { mdiTableColumn } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import SectionEditor from './SectionEditor.svelte';
import SectionWidget from './SectionWidget.svelte';

const info: WidgetInfo = {
    type: 'section', 
    label: 'Section',
    icon: mdiTableColumn,
    category: 'layout',
    widget: SectionWidget, 
    editor: SectionEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'section', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;