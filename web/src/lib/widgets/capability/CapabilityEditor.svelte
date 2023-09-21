<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { devices, homey } from '$lib/stores/homey';

    // UI elements
    import DevicePicker from '$lib/components/DevicePicker.svelte';

    // Tailwind
    import Divider from "stwui/divider";
    import List from "stwui/list";

    import type CapabilitySettings from "./CapabilitySettings";
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import type { Capability_v3 } from './CapabilitySettings';
    import CapabilityEditorLine from './CapabilityEditorLine.svelte';

    const dispatch = createEventDispatcher();
    
    export let settings: CapabilitySettings;

    let deviceId: string | undefined;
    let capabilities: Capability_v3[] = [];

    let device: DeviceObj | undefined;

    let selectedCapability: string | undefined;

    $: onSettings(settings);

    $: device = deviceId ? $devices[deviceId] : undefined;
    
    $: flatDevices = Object.values($devices);
    $: flatCapabilities = (device?.capabilitiesObj ? Object.values(device.capabilitiesObj) : [])
            .filter(c => !capabilities.map(c => c.capabilityId).includes(c.id))
            .sort((a, b) => {
                if(a.title === b.title) return 0;
                if(a.title < b.title) return -1;
                return 1;
            });

    $: onDevice(deviceId);
    $: onCapability(selectedCapability);

    function onSettings(s: CapabilitySettings) {
        deviceId = s?.deviceId;
        capabilities = [ ...(s?.capabilities ?? []) ];
    }

    function onDevice(id: string | undefined) {
        if(id !== settings.deviceId) {
            deviceId = id;
            dispatch('settings', { ...settings, deviceId: id, capabilityIds: [] });
        }
    }

    function onCapability(id: string | undefined) {
        if(id === undefined) {
            return;
        }

        capabilities.push({ capabilityId: id!, title: undefined });
        dispatch('settings', { ...settings, capabilities });

        selectedCapability = undefined;
    }

    function moveUp(capabilityId: string) {
        const index = capabilities.findIndex(c => c.capabilityId === capabilityId);

        if(index < 1) {
            return;
        }

        const previous = capabilities[index - 1];
        const current = capabilities[index];

        const copy = [...capabilities];
        copy[index - 1] = current;
        copy[index] = previous;

        capabilities = copy;
        dispatch('settings', { ...settings, capabilities });
    }

    function moveDown(capabilityId: string) {
        const index = capabilities.findIndex(c => c.capabilityId === capabilityId);

        if(index == (capabilities.length - 1)) {
            return;
        }

        const next = capabilities[index + 1];
        const current = capabilities[index];

        const copy = [...capabilities];
        copy[index + 1] = current;
        copy[index] = next;

        capabilities = copy;
        dispatch('settings', { ...settings, capabilities });
    }

    function remove(capabilityId: string) {
        capabilities = capabilities.filter(c => c.capabilityId !== capabilityId);
        dispatch('settings', { ...settings, capabilities });
    }

    function updateCapability(index: number, capability: Capability_v3) {
        const copy = [...capabilities];
        copy[index] = capability;

        dispatch('settings', { ...settings, capabilities: copy });
    }
</script>

<div>
    <DevicePicker bind:deviceId={deviceId} devices={flatDevices} />
</div>

{#if device}
    <div>
        <CapabilityPicker bind:capabilityId={selectedCapability} capabilities={flatCapabilities} placeholder="Add capability" />
    </div>

    <Divider>
        <Divider.Label slot="label">Capabilities</Divider.Label>
    </Divider>

    <div>        
        <List>
            {#each capabilities as capability, i}
                <List.Item class="pt-1 pb-1">
                    <CapabilityEditorLine 
                        settings={capability} 
                        capability={device.capabilitiesObj[capability.capabilityId]}
                        index={i}
                        capabilities={capabilities.length}
                        on:settings={e => updateCapability(i, e.detail)}
                        on:moveUp={e => moveUp(capability.capabilityId)}
                        on:moveDown={e => moveDown(capability.capabilityId)}
                        on:remove={e => remove(capability.capabilityId)}
                    />
                </List.Item>
            {/each}
        </List>
    </div>
{/if}