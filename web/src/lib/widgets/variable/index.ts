import { mdiVariable } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import VariableEditor from './VariableEditor.svelte';
import VariableWidget from './VariableWidget.svelte';
import { create, migrate } from './VariableSettings';

const info: WidgetInfo = {
    type: 'variable', 
    label: 'Variable',
    icon: mdiVariable,
    category: 'component',
    widget: VariableWidget, 
    editor: VariableEditor,
    scopes: [
        { oneOf: ['homey', 'homey.logic', 'homey.logic.readonly'] }
    ],
    create: create,
    migration: migrate
};

export default info;