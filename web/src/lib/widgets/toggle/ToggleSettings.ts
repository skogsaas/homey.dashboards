import type { WidgetSettings_v1, WidgetStateBinding } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface ToggleSettings_v2 extends WidgetSettings_v1 {
    label?: string | WidgetStateBinding;
    icon?: string | WidgetStateBinding;

    color?: string | WidgetStateBinding;
    size?: string | WidgetStateBinding;

    value?: boolean | WidgetStateBinding;
}

export interface ToggleSettings_v1 extends WidgetSettings_v1 {
    uri: string | undefined;
    label: string | undefined;
    iconId: string | undefined;
}

export function create() : WidgetSettings_v1 {
    return { 
        id: uuid(), 
        type: 'toggle', 
        version: 1
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 2) {
        settings = migrateOnce(settings);
    }

    return settings;
}

export function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 1: return migrate_v1_v2(settings as ToggleSettings_v1);
        case 2: return settings;
    }
}

function migrate_v1_v2(v1: ToggleSettings_v1): any {
    const settings: ToggleSettings_v2 = {
        id: v1.id,
        type: v1.type,
        version: 2,
        label: v1.label,
        icon: (v1.iconId ?? { objectId: v1.uri, stateId: 'iconUrl' }) as string | WidgetStateBinding,
        value: v1.uri ? { objectId: v1.uri, stateId: 'value' } : undefined
    };

    console.log(settings);

    return settings;
}
