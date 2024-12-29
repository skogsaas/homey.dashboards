import { CapabilityObj, DeviceObj, Variable, Zone } from "$lib/types/Homey";

export interface Item {
    uri: string;
    title: string;
    subtitle?: string;
    subtitleAlt?: string;
    iconId?: string;
    iconUrl?: string;
    search: string;
    type: 'zone' | 'variable' | 'device' | 'capability';

    zone?: Zone;
    variable?: Variable;
    device?: DeviceObj;
    capability?: CapabilityObj;
}