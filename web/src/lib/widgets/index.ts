import type { ComponentType } from 'svelte';
import type { WidgetCategory, WidgetInfo, WidgetSettings_v1 } from '$lib/types/Widgets';

import CapabilityInfo from './capability';
import CardInfo from './card';
import DashboardLinkInfo from './dashboard-link';
import DeviceInfo from './device';
import FlowInfo from './flow';
import ForeachInfo from './foreach';
import GridInfo from './grid';
import IframeInfo from './iframe';
import ImageInfo from './image';
import InsightInfo from './insight';
import ListInfo from '$lib/widgets/list';
import SectionInfo from '$lib/widgets/section';
import SectionsInfo from '$lib/widgets/sections';
import SensorInfo from '$lib/widgets/sensor';
import SliderInfo from './slider';
import StatisticInfo from './statistic';
import SwitchInfo from './switch';
import TemplateInfo from './template';
import TextInfo from './text';
import ToggleInfo from './toggle';
import UnknownInfo from './unknown';
import VariableInfo from './variable';
import DialogInfo from './dialog';

export const widgets: WidgetInfo[] = [
    //StatisticInfo,
    CapabilityInfo,
    CardInfo,
    DashboardLinkInfo,
    DeviceInfo,
    DialogInfo,
    FlowInfo,
    ForeachInfo,
    GridInfo,
    IframeInfo,
    ImageInfo,
    InsightInfo,
    ListInfo,
    SectionInfo,
    SectionsInfo,
    SensorInfo,
    SliderInfo,
    SwitchInfo,
    TemplateInfo,
    TextInfo,
    ToggleInfo,
    VariableInfo,
];

export const categories: WidgetCategory[] = [
    { id: 'layout', label: 'Layouts' },
    { id: 'logic', label: 'Logic' },
    { id: 'component', label: 'Components' },
];

export function findInfo(type: string) : WidgetInfo | undefined {
    return widgets.find(widget => widget.type === type);
}

export function findLabel(type: string) : string | undefined {
    return widgets.find(widget => widget.type === type)?.label;
}

export function findWidget(type: string) : ComponentType {
    const component = widgets.find(widget => widget.type === type)?.widget;

    if(component !== undefined) {
        return component;
    }

    return UnknownInfo.widget;
}

export function findEditor(type: string) : ComponentType {
    const editor = widgets.find(widget => widget.type === type)?.editor;

    if(editor !== undefined) {
        return editor;
    }

    return UnknownInfo.editor;
}

export function findMigration(type: string) : ((settings: WidgetSettings_v1) => WidgetSettings_v1) | undefined {
    const migration = widgets.find(widget => widget.type === type)?.migration;

    return migration;
}

export function findCreate(type: string) : (() => WidgetSettings_v1) | undefined {
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