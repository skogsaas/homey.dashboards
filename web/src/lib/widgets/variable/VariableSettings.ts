import type { WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface VariableSettings_v1 extends WidgetSettings {
    variableId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;

    number?: {
        min?: number; 
        max?: number;
        step?: number;
        unit?: string;
    }
}

export function create() : WidgetSettings {
    return { 
        id: uuid(), 
        type: 'variable', 
        version: 1
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 1) {
        settings = migrateOnce(settings);
    }

    return settings;
}

function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 1: 
        default: return settings;
    }
}