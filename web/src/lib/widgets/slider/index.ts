import { mdiArrowLeftRight } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import SliderEditor from './SliderEditor.svelte';
import SliderWidget from './SliderWidget.svelte';
import { create, migrate } from './SliderSettings';

const info: WidgetInfo = {
    type: 'slider', 
    label: 'Slider',
    icon: mdiArrowLeftRight,
    category: 'component',
    widget: SliderWidget, 
    editor: SliderEditor,
    scopes: [
        { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
    ],
    create: create,
    migration: migrate
};

export default info;