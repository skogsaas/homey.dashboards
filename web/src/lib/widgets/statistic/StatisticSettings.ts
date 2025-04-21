import type { WidgetSettings_v1 } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface StatisticSettings_v1 extends WidgetSettings_v1 {
    insightId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
    aggregation: 'none' | 'min' | 'max' | 'sum' | 'avg' | 'first' | 'last' | undefined;
    resolution: 'lastHour' | 'last6Hours' | 'last24Hours' | 'last7Days' | 'last14Days' | 'last31Days' | 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'lastYear' | 'last2Years' | undefined;
 }

export function create() : WidgetSettings_v1 {
    return { 
        id: uuid(), 
        type: 'statistic', 
        version: 1
     };
}

export function migrate(settings: any) : any {
    return settings;
}