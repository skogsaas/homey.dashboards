import { v4 as uuid } from 'uuid';
import { mdiMeterElectric } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import DeviceEditor from './DeviceEditor.svelte';
import DeviceWidget from './DeviceWidget.svelte';

const info: WidgetInfo = {
    type: 'device', 
    label: 'Device',
    icon: mdiMeterElectric,
    category: 'component',
    widget: DeviceWidget, 
    editor: DeviceEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'device', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;