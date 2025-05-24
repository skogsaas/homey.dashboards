import { v4 as uuid } from 'uuid';
import { mdiEyeLock, mdiMenu } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import SecuredEditor from './SecuredEditor.svelte';
import SecuredWidget from './SecuredWidget.svelte';

const info: WidgetInfo = {
    type: 'secured', 
    label: 'Secured',
    icon: mdiEyeLock,
    category: 'logic',
    widget: SecuredWidget, 
    editor: SecuredEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'secured', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;