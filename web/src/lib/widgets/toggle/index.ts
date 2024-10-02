import { mdiToggleSwitch } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import ToggleEditor from './ToggleEditor.svelte';
import ToggleWidget from './ToggleWidget.svelte';
import { create, migrate } from './ToggleSettings';

const info: WidgetInfo = {
    type: 'toggle', 
    label: 'Toggle',
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