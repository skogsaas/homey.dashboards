import { mdiChartLine } from '$lib/components/icons';
import type { WidgetInfo } from "$lib/types/Widgets";

import InsightEditor from './InsightEditor.svelte';
import InsightWidget from './InsightWidget.svelte';
import { create, migrate } from './InsightSettings';

const info: WidgetInfo = {
    type: 'insight', 
    label: 'Insight',
    icon: mdiChartLine,
    category: 'component',
    widget: InsightWidget, 
    editor: InsightEditor,
    scopes: [
        { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] },
        { oneOf: ['homey', 'homey.insights.readonly'] }
    ],
    create: create,
    migration: migrate
};

export default info;