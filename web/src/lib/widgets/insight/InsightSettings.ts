import type { WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export default interface InsightSettings_v2 extends WidgetSettings {
    insightId: string | undefined;
    resolution: string | undefined;
    aggregation: 'none' | 'min' | 'max' | 'sum' | 'avg' | 'first' | 'last';
    sampleRate: number | undefined;
}

export interface InsightSettings_v1 extends WidgetSettings {
    deviceId: string | undefined;
    insightId: string | undefined;
    resolution: string | undefined;
}

export function create() : WidgetSettings {
    return { 
        id: uuid(), 
        type: 'insight', 
        version: 2
     };
}

export function migrate(settings: any) : any {
    switch(settings.version) {
        case 2: return settings;
        
        case 1:
        default: return migrate_v1_v2(settings as InsightSettings_v1);
    }
}

function migrate_v1_v2(v1: InsightSettings_v1) : InsightSettings_v2 {
    const settings: InsightSettings_v2 = {
        id: v1.id,
        type: v1.type,
        version: 2,
        insightId: v1.insightId?.startsWith('homey:') ? v1.insightId : 'homey:device:' + v1.deviceId + ':' + v1.insightId,
        resolution: v1.resolution,
        aggregation: 'none',
        sampleRate: undefined
    }

    return settings;
}