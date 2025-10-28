import { mdiToggleSwitch } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import ToggleEditor from './ButtonEditor.svelte';
import ToggleWidget from './ButtonWidget.svelte';
import { create, migrate } from './ButtonSettings';

const info: WidgetInfo = {
    type: 'button', 
    label: 'Button',
    icon: mdiToggleSwitch,
    category: 'component',
    widget: ToggleWidget, 
    editor: ToggleEditor,
    scopes: [
        { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
    ],
    create: create,
    migration: migrate
}

export default info;