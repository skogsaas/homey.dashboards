import type { Threshold, WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface InsightSettings_v5 extends WidgetSettings {
    resolution: string | undefined;
    series: Series_v5[];
}

export interface Series_v5 extends Series_v3 {
    title?: string;
    type?: string;
    fill?: boolean;
    border?: Threshold[];
    background?: Threshold[];
}

export interface InsightSettings_v4 extends WidgetSettings {
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
    aggregation?: 'none' | 'min' | 'max' | 'sum' | 'avg' | 'first' | 'last';
    sampleRate?: number;
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
        version: 5
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 5) {
        settings = migrateOnce(settings);
    }

    return settings;
}

export function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 5: return settings;
        case 4: return migrate_v4_v5(settings as InsightSettings_v4);
        case 3: return migrate_v3_v4(settings as InsightSettings_v3);
        case 2: return migrate_v2_v3(settings as InsightSettings_v2);
        case 1:
        default: return migrate_v1_v2(settings as InsightSettings_v1);
    }
}

function migrate_v4_v5(v4: InsightSettings_v4) : InsightSettings_v5 {
    const settings: InsightSettings_v5 = {
        id: v4.id,
        type: v4.type,
        version: 5,
        resolution: v4.resolution,
        series: (v4.series ?? []).map(s => ({
            insightId: s.insightId,
            aggregation: s.aggregation,
            sampleRate: s.sampleRate,
            title: s.title,
            type: s.type,
            fill: s.fill,
            border: s.borderColor ? [{ id: uuid(), color: s.borderColor, value: Number.MIN_SAFE_INTEGER }] : undefined,
            background: s.backgroundColor ? [{ id: uuid(), color: s.backgroundColor, value: Number.MIN_SAFE_INTEGER }] : undefined
        }))
    }

    return settings;
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