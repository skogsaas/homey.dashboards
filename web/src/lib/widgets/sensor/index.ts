import { mdiEye } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import SensorEditor from './SensorEditor.svelte';
import SensorWidget from './SensorWidget.svelte';
import { create, migrate } from './SensorSettings';

const info: WidgetInfo = {
    type: 'sensor', 
    label: 'Sensor',
    icon: mdiEye,
    category: 'component',
    widget: SensorWidget, 
    editor: SensorEditor,
    scopes: [
        { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
    ],
    create: create,
    migration: migrate
}

export default info;