import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface ForeachSettings_v1 extends WidgetSettings_v1 {
    slug?: string;

    each?: 'capability' | 'device' | 'zone' | 'flow' | 'folder' | 'image';
    
    in?: 'device' | 'zone' | 'folder';
    inArg?: string;
    
    where?: string; // Object property name
    whereOp?: 'equal' | 'not-equal' | 'starts-with' | 'contains' | 'ends-with';
    whereArg?: string;

    item?: WidgetSettings_v1;
}