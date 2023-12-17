import type { WidgetSettings } from "./Widgets";

export interface GridLayout_v1 {
    breakpoint: number;
    columns: number;
    rowHeight: number;

    items: GridLayoutItem_v1[];
}

export interface GridLayoutItem_v1 {
    id: string;
    x: number; 
    y: number; 
    w: number; 
    h: number;
    container?: boolean;
    children?: GridLayoutItem_v1[];
}

export interface GridItem_v1 {
    id: string;
    version: number;
    
    card: WidgetSettings[];
    view: WidgetSettings[];
    
    [key: number]: GridBreakpointItem;
}

export interface GridItem_v0 {
    id: string;
    version: number;
    settings: WidgetSettings;
    
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