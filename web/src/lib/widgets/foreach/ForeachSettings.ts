import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface ForeachSettings_v1 extends WidgetSettings_v1 {
    slug?: string;

    each?: 'capability' | 'device' | 'zone' | 'flow' | 'folder' | 'image';
    
    in?: 'device' | 'zone' | 'folder';
    inArg?: string;
    
    where?: ForeachCondition_v1[];
    whereOp?: 'and' | 'or';

    item?: WidgetSettings_v1;
}

export interface ForeachCondition_v1 {
    id: string;
    
    key?: string;
    operator?: 'equal' | 'not-equal' | 'starts-with' | 'contains' | 'ends-with';
    value?: string;
}