import type { Responsive, GridStackPosition } from "gridstack";
import type { WidgetSettings_v1 } from "./Widgets";

export interface GridOptions_v1 {
    cellHeight?: number;
    column?: number;
    columnOpts?: Responsive;
    float?: boolean;
    margin?: number;
}

export interface GridItem_v2 {
    id: string;
    settings: WidgetSettings_v1;
    position: GridStackPosition;
}

export interface GridItem_v1 {
    id: string;
    version: number;
    
    card: WidgetSettings_v1[];
    view: WidgetSettings_v1[];
    
    [key: number]: GridBreakpointItem;
}

export interface GridItem_v0 {
    id: string;
    version: number;
    settings: WidgetSettings_v1;
    
    [key: number]: GridBreakpointItem;
}

export interface GridBreakpointItem {
    x: number; 
    y: number;
    h: number;
    w: number;
    resizable: boolean;
    draggable: boolean;
    fixed: boolean;
    customDragger: boolean;
    customResizer: boolean;
}