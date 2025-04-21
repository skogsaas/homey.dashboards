import { v4 as uuid } from 'uuid';
import { mdiArrowDecision } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import SwitchEditor from './SwitchEditor.svelte';
import SwitchWidget from './SwitchWidget.svelte';

const info: WidgetInfo = {
    type: 'switch', 
    label: 'Switch',
    icon: mdiArrowDecision,
    category: 'logic',
    widget: SwitchWidget, 
    editor: SwitchEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'switch', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;