import { v4 as uuid } from 'uuid';
import { mdiViewDashboard } from '$lib/components/icons';
import type { WidgetInfo, WidgetSettings_v1 } from "$lib/types/Widgets";

import DashboardLinkEditor from './DashboardLinkEditor.svelte';
import DashboardLinkWidget from './DashboardLinkWidget.svelte';

const info: WidgetInfo = {
    type: 'dashboard-link', 
    label: 'Dashboard',
    icon: mdiViewDashboard,
    category: 'component',
    widget: DashboardLinkWidget, 
    editor: DashboardLinkEditor,
    scopes: [],
    create: () => ({ id: uuid(), type: 'dashboard-link', version: 1 }),
    migration: (e: WidgetSettings_v1) => e
};

export default info;