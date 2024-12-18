import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface ForeachSettings_v1 extends WidgetSettings_v1 {
    slug?: string;

    each?: 'capability' | 'device' | 'zone' | 'flow' | 'folder' | 'image';
    
    in?: 'device' | 'zone' | 'folder';
    inArg?: string;
    
    where?: ForeachCondition_v1[];
    whereOp?: 'and' | 'or';

    item?: WidgetSettings_v1;

    gap?: 'gap-0' | 'gap-0.5' | 'gap-1' | 'gap-2' | 'gap-3' | 'gap-4' | 'gap-5' | 'gap-6' | 'gap-7' | 'gap-8' | 'gap-9' | 'gap-10';
}

export interface ForeachCondition_v1 {
    id: string;
    
    key?: string;
    operator?: 'equal' | 'not-equal' | 'starts-with' | 'contains' | 'ends-with';
    value?: string;
}