import type { GridItem_v1, GridLayout_v1 } from "./Grid";
import type { WidgetSettingsMap } from "./Widgets";

export interface Dashboard_v2 {
    id: string;
    version: number;
    source: 'homey'|'localstorage';
    title: string;

    layouts: GridLayout_v1[];
    widgets: WidgetSettingsMap;

    backgroundImage: string | undefined;
}

export interface Dashboard_v1 {
    id: string;
    source: 'homey'|'localstorage';
    title: string;
    items: GridItem_v1[];
    backgroundImage: string | undefined;
}

export type DashboardMap = { [key: string]: Dashboard_v2; }