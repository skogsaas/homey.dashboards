<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import Select, { Option } from "@smui/select";
    import type CapabilitySettings from "./CapabilitySettings";
    import type { CapabilityObj, DeviceObj, DeviceMap, Homey } from '../../types/Homey';

    export let settings: CapabilitySettings;
    export let devices: DeviceMap;
    
    export let homey: Homey;

    const dispatch = createEventDispatcher();

    let device: DeviceObj | null = null;
    let capability: CapabilityObj | null = null;

    $: flatDevices = Object.values(devices).sort((a, b) => {
        if(a.name === b.name) return 0;
        if(a.name < b.name) return -1;
        return 1;
    });
    $: flatCapabilities = device?.capabilitiesObj ? Object.values(device.capabilitiesObj) : [];

    $: deviceId = onDevice(device);
    $: capabilityId = onCapability(capability);

    onMount(() => {
        if(settings.deviceId) {
            device = devices[settings.deviceId];
        }

        if(device && settings.capabilityId)
        {
            capability = device.capabilitiesObj[settings.capabilityId];
        }
    });

    function onDevice(value: DeviceObj | null) : string | null {
        if(value == null || value.id === settings.deviceId) {
            return null;
        }

        device = value;
        settings.deviceId = value.id;

        // Reset the capability after changing device
        capability = null;
        settings.capabilityId = null;

        dispatch('settings', settings);

        return settings.deviceId;
    }

    function onCapability(value: CapabilityObj | null) : string | null {
        if(value == null || value.id === settings.capabilityId) {
            return null;
        }

        capability = value;
        settings.capabilityId = value.id;

        dispatch('settings', settings);

        return settings.capabilityId;
    }
</script>

<div>
    <Select bind:value={device} label="Device">
        {#each flatDevices as flatDevice}
          <Option value={flatDevice}>{flatDevice.name}</Option>
        {/each}
    </Select>
</div>

<div>
{#if device}
    <Select bind:value={capability} label="Capability">
        {#each flatCapabilities as flatCapability}
            <Option value={flatCapability}>{flatCapability.title}</Option>
        {/each}
    </Select>
{/if}
</div>