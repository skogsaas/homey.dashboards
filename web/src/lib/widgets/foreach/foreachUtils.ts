import { v4 as uuid } from 'uuid';
import type { DeviceMap, Zone, ZoneMap } from "$lib/types/Homey";
import type { ForeachCondition_v1, ForeachSettings_v1 } from "./ForeachSettings";

export function generateItems(devices: DeviceMap, zones: ZoneMap, settings: ForeachSettings_v1) : any[] {
    var items: any[] = [];

    if(settings.each !== undefined && settings.in !== undefined && settings.inArg !== undefined) {
        if(settings.each === 'capability') {
            if(settings.in === 'device') {
                const device = devices[settings.inArg ?? ''];

                if(device !== undefined) {
                    items = Object.keys(device.capabilitiesObj).map(key => device.capabilitiesObj[key]);
                }
            } else if (settings.in === 'zone') {
                const z = getZones(zones, settings.inArg);

                items = Object
                    .values(devices)
                    .filter(device => z.some(zone => zone.id === device.zone))
                    .flatMap(device => Object.keys(device.capabilitiesObj).map(key => device.capabilitiesObj[key]));
            }
        } else if(settings.each === 'device') {
            if (settings.in === 'zone') {
                const z = getZones(zones, settings.inArg);

                items = Object
                    .values(devices)
                    .filter(device => z.some(zone => zone.id === device.zone));
            }
        } else if(settings.each === 'zone') {
            if (settings.in === 'zone') {
                items = getZones(zones, settings.inArg);
            }
        } else if(settings.each === 'flow') {
            // TODO
        } else if(settings.each === 'folder') {
            // TODO
        } else if(settings.each === 'image') {
            // TODO
        }
    }

    if(items.length > 0 && settings.where !== undefined && settings.where.length > 0) {
        items = items.filter(item => {
            switch(settings.whereOp) {
                case 'or': 
                    return settings.where!.some(where => evaluateCondition(item, where));
                
                case 'and':
                default:
                    return settings.where!.every(where => evaluateCondition(item, where));
            }
        })
    }

    return items;
}

function evaluateCondition(item: any, where: ForeachCondition_v1) : boolean {
    switch(where.operator) {
        case 'equal': return item[where.key!] === where.value;
        case 'not-equal': return item[where.key!] !== where.value;
        case 'starts-with': return `${item[where.key!]}`.startsWith(where.value!);
        case 'contains': return `${item[where.key!]}`.includes(where.value!);
        case 'ends-with': return `${item[where.key!]}`.endsWith(where.value!);
        default: return false;
    }
}

function getZones(zones: ZoneMap, zoneId: string) : Zone[] {
    return Object.values(zones)
        .filter(zone => zone.parent === zoneId)
        .flatMap(zone => [zone, ...getZones(zones, zone.id)]);
}

