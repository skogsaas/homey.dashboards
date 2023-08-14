import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';

import type { AdvancedFlow, AdvancedFlowMap, BasicFlow, BasicFlowMap, CapabilityEvent, DeviceMap, Homey, Session } from '$lib/types/Homey';

function createBaseUrl() {
    return derived([homey, page], ([$homey, $page], set) => {
        if($homey !== undefined) {
            $homey.baseUrl.then(u => set(u))
        } 
        else if(import.meta.env.VITE_HOMEY_URL) { // Inject development variables
            set(import.meta.env.VITE_HOMEY_URL);
        } else {
            set($page.url.origin);
        }
    });
}

function createDevices() {
    const { subscribe, set, update } = writable({} as DeviceMap);

    return {
        subscribe,
        set,
        onCapability: (deviceId: string, event: CapabilityEvent) => update((existing: DeviceMap) => onCapability(existing, deviceId, event))
    };
}

function onCapability(existing: DeviceMap, deviceId: string, event: CapabilityEvent) : DeviceMap {
    const device = existing[deviceId];
    const capability = device.capabilitiesObj[event.capabilityId];
    capability.value = event.value;
    capability.lastUpdated.setUTCMilliseconds(event.transactionTime);

    return { ...existing };
}

function createBasicFlows() {
    const { subscribe, set, update } = writable({} as BasicFlowMap);

    return {
        subscribe,
        set,
        onCreate: (flow: BasicFlow) => update((existing: BasicFlowMap) => ({ ...existing })),
        onDelete: (flow: BasicFlow) => update((existing: BasicFlowMap) => { const copy = {...existing}; delete copy[flow.id]; return copy; })
    };
}

function createAdvancedFlows() {
    const { subscribe, set, update } = writable({} as AdvancedFlowMap);

    return {
        subscribe,
        set,
        onCreate: (flow: AdvancedFlow) => update((existing: AdvancedFlowMap) => ({ ...existing })),
        onDelete: (flow: AdvancedFlow) => update((existing: AdvancedFlowMap) => { const copy = {...existing}; delete copy[flow.id]; return copy; })
    };
}

export const homey = writable(undefined as (Homey | undefined));
export const baseUrl = createBaseUrl();
export const session = writable(undefined as (Session | undefined));
export const scopes = derived(session, (s: Session) => s?.scopes, undefined);
export const devices = createDevices();
export const basicFlows = createBasicFlows();
export const advancedFlows = createAdvancedFlows();