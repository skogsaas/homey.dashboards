import type { ComponentType } from 'svelte';
import type { WidgetCategory, WidgetInfo, WidgetSettings_v1 } from '$lib/types/Widgets';

import CardInfo from '$lib/widgets/card';
import DashboardLinkInfo from '$lib/widgets/dashboard-link';
import DeviceInfo from '$lib/widgets/device';
import FlowInfo from '$lib/widgets/flow';
import ForeachInfo from '$lib/widgets/foreach';
import GridInfo from '$lib/widgets/grid';
import IframeInfo from '$lib/widgets/iframe';
import ImageInfo from '$lib/widgets/image';
import InsightInfo from '$lib/widgets/insight';
import ListInfo from '$lib/widgets/list';
import ReadonlyInfo from '$lib/widgets/readonly';
import SectionInfo from '$lib/widgets/section';
import SectionsInfo from '$lib/widgets/sections';
import SecuredInfo from '$lib/widgets/secured';
import SensorInfo from '$lib/widgets/sensor';
import SliderInfo from '$lib/widgets/slider';
import StatisticInfo from '$lib/widgets/statistic';
import SwitchInfo from '$lib/widgets/switch';
import TemplateInfo from '$lib/widgets/template';
import TextInfo from '$lib/widgets/text';
import ToggleInfo from '$lib/widgets/toggle';
import UnknownInfo from '$lib/widgets/unknown';
import VariableInfo from '$lib/widgets/variable';
import DialogInfo from '$lib/widgets/dialog';

export const widgets: WidgetInfo[] = [
    //StatisticInfo,
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
    ReadonlyInfo,
    SectionInfo,
    SectionsInfo,
    SecuredInfo,
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