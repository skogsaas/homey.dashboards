import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface SwitchSettings_v1 extends WidgetSettings_v1 {
    switch?: 'capability' | 'variable' | 'device' | 'user';
    switchArg?: string;

    // Property name of the object we're tracking. Based on the object type
    // only a limited set of options should be presented.
    case?: string;
    cases?: SwitchCase_v1[];
}

export interface SwitchCase_v1 {
    id?: string;
    
    operator?: 'equal' | 'not-equal' | 'starts-with' | 'contains' | 'ends-with' | 'less-than' | 'greater-than';
    value?: any;
    item?: WidgetSettings_v1;
}