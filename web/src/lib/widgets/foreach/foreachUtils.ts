import { v4 as uuid } from 'uuid';
import type { DeviceMap, Zone, ZoneMap } from "$lib/types/Homey";
import type { TemplateSettings_v1 } from "../template/TemplateSettings";
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

export function transform(item: any, data: any, slug: string) : any {
    if(item === undefined) return undefined;

    if(Array.isArray(item)) {
        return (item as any[]).map(a => transform(a, data, slug));
    } else if(typeof item === 'object') {
        const copy = { ...item };

        if(isWidget(copy)) {
            // Replace the ID of all sub widgets, as multiple instances of the sub widgets might collide if 
            // they have the same IDs.
            copy.id = uuid();

            if(copy.type === 'template') {
                // Stop recursion if a template widget is detected. Instead only populate/replace template 
                // arguments with arguments from this template.

                (copy as TemplateSettings_v1).arguments = ((copy as TemplateSettings_v1).arguments ?? []).map(a => ({
                    argId: a.argId,
                    value: transform(a.value, data, slug)
                }));

                return copy;
            }
        }

        Object.keys(copy).forEach(key => copy[key] = transform(copy[key], data, slug));

        return copy;
    } else if(typeof item === 'string') {
        let copy = item as string;

        // Replace any template arguments being used.
        const variableRegex = /\$\{([^}]+)\.([^}]+)\}/g;
        const matches: string[][] = [...copy.matchAll(variableRegex)];

        for(const match of matches) {
            const fullMatch = match[0];
            const matchSlug = match[1];
            const itemKey = match[2];

            // Require the variable to be in the form ${slug.property}
            if(matchSlug !== slug) continue;

            if(Object.hasOwn(data, itemKey)) {
                const itemValue = data[itemKey];
                
                if(copy === fullMatch) {
                    copy = itemValue;
                } else {
                    copy = copy.replaceAll(fullMatch, itemValue);
                }
            }
        }

        return copy;
    } else {
        return item;
    }
}

function isWidget(element: any) : boolean {
    return Object.hasOwn(element, 'id') &&
        Object.hasOwn(element, 'type') &&
        Object.hasOwn(element, 'version');
}