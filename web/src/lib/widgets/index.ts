import type { ComponentType } from 'svelte';

import { v4 as uuid } from 'uuid';

import CapabilityEditor from "./capability/CapabilityEditor.svelte";
import CapabilityWidget from "./capability/CapabilityWidget.svelte";
import { 
    create as createCapability,
    migrate as migrateCapability 
} from './capability/CapabilitySettings';

import DashboardLinkEditor from './dashboard-link/DashboardLinkEditor.svelte';
import DashboardLinkWidget from './dashboard-link/DashboardLinkWidget.svelte';

import FlowEditor from "./flow/FlowEditor.svelte";
import FlowWidget from "./flow/FlowWidget.svelte";

import ImageWidget from "./image/ImageWidget.svelte";
import ImageEditor from "./image/ImageEditor.svelte";

import InsightWidget from "./insight/InsightWidget.svelte";
import InsightEditor from "./insight/InsightEditor.svelte";
import { 
    create as createInsight,
    migrate as migrateInsight 
} from './insight/InsightSettings';

import TextEditor from "./text/TextEditor.svelte";
import TextWidget from "./text/TextWidget.svelte";

import UnknownWidget from '$lib/widgets/unknown/UnknownWidget.svelte';
import UnknownEditor from '$lib/widgets/unknown/UnknownEditor.svelte';
import type { WidgetSettings } from '$lib/types/Widgets';

// Icons
import { mdiChartLine, mdiImage, mdiPlay, mdiTextBoxEdit, mdiTune, mdiViewDashboard } from "$lib/components/icons";

export interface WidgetInfo {
    type: string;
    label: string;
    icon: string;
    widget: ComponentType;
    editor: ComponentType | undefined;
    view: ComponentType | undefined;
    scopes: { oneOf: string[] }[];
    create: () => WidgetSettings;
    migration: (e: WidgetSettings) => WidgetSettings;
}

export const widgets: WidgetInfo[] = [
    {
        type: 'capability', 
        label: 'Device Capabilities',
        icon: mdiTune,
        widget: CapabilityWidget, 
        editor: CapabilityEditor,
        view: undefined,
        scopes: [
            { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
        ],
        create: createCapability,
        migration: migrateCapability
    },
    {
        type: 'dashboard-link', 
        label: 'Dashboard',
        icon: mdiViewDashboard,
        widget: DashboardLinkWidget, 
        editor: DashboardLinkEditor,
        view: undefined,
        scopes: [],
        create: () => ({ id: uuid(), type: 'dashboard-link', version: 1 }),
        migration: (e: WidgetSettings) => e
    },
    {
        type: 'flow', 
        label: 'Flow',
        icon: mdiPlay,
        widget: FlowWidget, 
        editor: FlowEditor,
        view: undefined,
        scopes: [
            { oneOf: ['homey', 'homey.flow', 'homey.flow.start'] }
        ],
        create: () => ({ id: uuid(), type: 'flow', version: 1 }),
        migration: (e: WidgetSettings) => e
    },
    {
        type: 'image', 
        label: 'Image',
        icon: mdiImage,
        widget: ImageWidget, 
        editor: ImageEditor,
        view: ImageWidget,
        scopes: [
            { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] }
        ],
        create: () => ({ id: uuid(), type: 'image', version: 1 }),
        migration: (e: WidgetSettings) => e
    },
    {
        type: 'insight', 
        label: 'Insight',
        icon: mdiChartLine,
        widget: InsightWidget, 
        editor: InsightEditor,
        view: undefined,
        scopes: [
            { oneOf: ['homey', 'homey.device', 'homey.device.readonly', 'homey.device.control'] },
            { oneOf: ['homey', 'homey.insights.readonly'] }
        ],
        create: createInsight,
        migration: migrateInsight
    },
    {
        type: 'text', 
        label: 'Text',
        icon: mdiTextBoxEdit,
        widget: TextWidget, 
        editor: TextEditor,
        view: undefined,
        scopes: [],
        create: () => ({ id: uuid(), type: 'text', version: 1 }),
        migration: (e: WidgetSettings) => e
    },
];

export function findLabel(type: string) : string | undefined {
    const label = widgets.find(widget => widget.type === type)?.label;

    return label;
}

export function findWidget(type: string) : ComponentType {
    const component = widgets.find(widget => widget.type === type)?.widget;

    if(component != undefined) {
        return component;
    }

    return UnknownWidget
}

export function findEditor(type: string) : ComponentType {
    const editor = widgets.find(widget => widget.type === type)?.editor;

    if(editor != undefined) {
        return editor;
    }

    return UnknownEditor
}

export function findView(type: string) : ComponentType | undefined {
    const view = widgets.find(widget => widget.type === type)?.view;

    return view;
}

export function findMigration(type: string) : ((settings: WidgetSettings) => WidgetSettings) | undefined {
    const migration = widgets.find(widget => widget.type === type)?.migration;

    return migration;
}

export function findCreate(type: string) : (() => WidgetSettings) | undefined {
    const create = widgets.find(widget => widget.type === type)?.create;

    return create;
}

export function hasRequiredScopes(type: string, scopes: string[]) : boolean {
    const requirements = widgets.find(widget => widget.type === type)?.scopes;

    if(requirements === undefined || requirements.length === 0) {
        return true;
    }

    return requirements.every(requirement => requirement.oneOf.some((r) => scopes.includes(r)));
}