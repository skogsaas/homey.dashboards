import type { CapabilityEvent, DeviceMap, Homey } from '$lib/types/Homey';
import { writable } from 'svelte/store';

function createDevices() {
    const { subscribe, set, update } = writable({} as DeviceMap);

    return {
        subscribe,
        set,
        capabilityUpdate: (deviceId: string, event: CapabilityEvent) => update((existing: DeviceMap) => onCapabilityUpdate(existing, deviceId, event))
    };
}

function onCapabilityUpdate(existing: DeviceMap, deviceId: string, event: CapabilityEvent) : DeviceMap {
    const device = existing[deviceId];
    const capability = device.capabilitiesObj[event.capabilityId];
    capability.value = event.value;
    capability.lastUpdated.setUTCMilliseconds(event.transactionTime);

    return { ...existing };
}

export const devices = createDevices();
export const homey = writable({} as Homey);