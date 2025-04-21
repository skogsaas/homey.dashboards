import { mdiMeterElectric } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import DeviceEditor from './DeviceEditor.svelte';
import DeviceWidget from './DeviceWidget.svelte';
import { create, migrate } from './DeviceSettings';

const info: WidgetInfo = {
    type: 'device', 
    label: 'Device',
    icon: mdiMeterElectric,
    category: 'component',
    widget: DeviceWidget, 
    editor: DeviceEditor,
    scopes: [],
    create: create,
    migration: migrate,
    deprecated: true
};

export default info;