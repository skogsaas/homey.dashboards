import { mdiTune } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import CapabilityEditor from './CapabilityEditor.svelte';
import CapabilityWidget from './CapabilityWidget.svelte';
import { create, migrate } from './CapabilitySettings';

const info: WidgetInfo = {
    type: 'capability', 
    label: 'Capability',
    icon: mdiTune,
    category: 'component',
    widget: CapabilityWidget, 
    editor: CapabilityEditor,
    scopes: [
        { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
    ],
    create: create,
    migration: migrate,
    deprecated: true
}

export default info;