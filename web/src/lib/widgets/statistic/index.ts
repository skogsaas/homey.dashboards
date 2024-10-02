import { v4 as uuid } from 'uuid';
import { mdiPencilBox } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import StatisticEditor from './StatisticEditor.svelte';
import StatisticWidget from './StatisticWidget.svelte';

const info: WidgetInfo = {
    type: 'statistic', 
    label: 'Statistic',
    icon: mdiPencilBox,
    category: 'component',
    widget: StatisticWidget, 
    editor: StatisticEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'statistic', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;