import type { GridItem_v1, GridItem_v2, GridOptions_v1 } from "./Grid";
import type { Style_v1 } from "./Styling";
import type { WidgetSettings_v1 } from "./Widgets";

export interface Dashboard_v2 {
    id: string;
    version: number;
    source: 'homey'|'localstorage';
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

export type DashboardMap = { [key: string]: Dashboard_v2; }