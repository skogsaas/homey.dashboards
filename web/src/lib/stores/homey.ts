import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';

import type { CapabilityEvent, DeviceMap, Homey } from '$lib/types/Homey';

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

export const baseUrl = derived(page, ($page, set) => {
    let value = $page.url.origin;

    // Inject development variables
    if(import.meta.env.VITE_HOMEY_URL) {
        value = import.meta.env.VITE_HOMEY_URL;
    }

    set(value);
});