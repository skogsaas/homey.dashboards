import { v4 as uuid } from 'uuid';
import { mdiImage } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import ImageEditor from './ImageEditor.svelte';
import ImageWidget from './ImageWidget.svelte';

const info: WidgetInfo = {
    type: 'image', 
    label: 'Image',
    icon: mdiImage,
    category: 'component',
    widget: ImageWidget, 
    editor: ImageEditor,
    scopes: [
        { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
    ],
    create: () => ({ id: uuid(), type: 'image', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;