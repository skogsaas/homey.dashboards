import type { Threshold, WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface VariableSettings_v3 extends VariableSettings_v2 {
    iconId: string | undefined;
}

export interface VariableSettings_v2 extends WidgetSettings {
    variableId: string | undefined;
    title: string | undefined;

    boolean?: {
        variant?: 'toggle'|'icon-button'|'icon-group-horizontal'|'icon-group-vertical';

        iconId?: string;
        iconTrueId?: string;
        iconFalseId?: string;

        color?: string;
        colorTrue?: string;
        colorFalse?: string;
    };

    number?: {
        variant?: 'slider'|'input';
        
        min?: number; 
        max?: number;
        step?: number;
        unit?: string;

        thresholds?: Threshold[];
    };
}

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
        version: 2
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 3) {
        settings = migrateOnce(settings);
    }

    return settings;
}

function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 3: return settings;
        case 2: return migrate_v2_v3(settings as VariableSettings_v2);
        case 1:
        default: return migrate_v1_v2(settings as VariableSettings_v1);
    }
}

function migrate_v2_v3(v2: VariableSettings_v2) : VariableSettings_v3 {
    const settings: VariableSettings_v3 = {
        ...v2,
        version: 3,
        iconId: v2.boolean?.iconId
    }

    return settings;
}

function migrate_v1_v2(v1: VariableSettings_v1) : VariableSettings_v2 {
    const settings: VariableSettings_v2 = {
        id: v1.id,
        type: v1.type,
        version: 2,
        variableId: v1.variableId,
        title: v1.title
    }

    if(v1.number) {
        settings.number = {
            min: v1.number.min,
            max: v1.number.max,
            step: v1.number.step,
            unit: v1.number.unit,
        }
    }

    if(v1.iconId) {
        settings.boolean = {
            iconId: v1.iconId
        }
    }

    return settings;
}