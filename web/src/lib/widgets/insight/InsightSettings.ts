import type { WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export default interface InsightSettings_v4 extends WidgetSettings {
    resolution: string | undefined;
    series: Series_v4[];
}

export interface Series_v4 extends Series_v3 {
    title: string | undefined;
    type: string | undefined;
    fill: boolean | undefined;
    borderColor: string | undefined;
    backgroundColor: string | undefined;
}

export interface InsightSettings_v3 extends WidgetSettings {
    resolution: string | undefined;
    series: Series_v3[];
}

export interface Series_v3 {
    insightId: string | undefined;
    aggregation: 'none' | 'min' | 'max' | 'sum' | 'avg' | 'first' | 'last';
    sampleRate: number | undefined;
}

export interface InsightSettings_v2 extends WidgetSettings {
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
        version: 4
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 4) {
        settings = migrateOnce(settings);
    }

    return settings;
}

export function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 4: return settings;
        case 3: return migrate_v3_v4(settings as InsightSettings_v3);
        case 2: return migrate_v2_v3(settings as InsightSettings_v2);
        case 1:
        default: return migrate_v1_v2(settings as InsightSettings_v1);
    }
}

function migrate_v3_v4(v3: InsightSettings_v3) : InsightSettings_v4 {
    const settings: InsightSettings_v4 = {
        id: v3.id,
        type: v3.type,
        version: 4,
        series: (v3.series ?? []).map(s => ({ ...s, type: 'line' }))
    }

    return settings;
}

function migrate_v2_v3(v2: InsightSettings_v2) : InsightSettings_v3 {
    const settings: InsightSettings_v3 = {
        id: v2.id,
        type: v2.type,
        version: 3,
        resolution: v2.resolution,
        series: [{ insightId: v2.insightId, aggregation: v2.aggregation, sampleRate: v2.sampleRate }]
    }

    return settings;
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