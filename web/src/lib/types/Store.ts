import type { GridItem_v1 } from "./Grid";
import type { Style_v1 } from "./Styling";
import type { WidgetSettings_v1 } from "./Widgets";

export interface Store_v1 {
    id: string;
    version: number;
    title: string;
    dashboards: Dashboard_v2[];
    templates: Template_v1[];
}

export interface Dashboard_v2 {
    id: string;
    version: number;
    title: string;

    root: WidgetSettings_v1 | undefined;

    iconId?: string;
    backgroundImage?: string;

    style?: Style_v1;
}

export interface Dashboard_v1 {
    id: string;
    source: 'homey'|'localstorage';
    title: string;
    items: GridItem_v1[];
    backgroundImage: string | undefined;
}

export interface Template_v1 {
    id: string;
    title: string;
    root: WidgetSettings_v1 | undefined;
    arguments: TemplateArgument_v1[];
    builtin?: boolean;
}

export interface TemplateArgument_v1 {
    id: string;
    label: string | undefined;
    type: 'string' | 'number' | 'boolean' | 'capabilityUri' | 'deviceId' | 'imageId' | 'iconId';
    default: any | undefined;
}

export type StoreMap = { [key: string]: Store_v1; }
export type DashboardMap = { [key: string]: Dashboard_v2; }
export type TemplateMap = { [key: string]: Template_v1; }