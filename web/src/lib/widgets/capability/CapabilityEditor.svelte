<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { devices } from '$lib/stores/homey';

    import Select, { Option } from "@smui/select";
    import List, { Item, Text, Separator } from '@smui/list';
    import IconButton from '@smui/icon-button';

    import type CapabilitySettings from "./CapabilitySettings";
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    const dispatch = createEventDispatcher();
    
    export let settings: CapabilitySettings;

    let deviceId: string | undefined;
    let capabilityIds: string[];

    let device: DeviceObj | undefined;
    let capabilities: CapabilityObj[];

    let selectedCapability: string | undefined;

    $: onSettings(settings);

    $: device = deviceId ? $devices[deviceId] : undefined;
    $: capabilities = device?.capabilitiesObj ? capabilityIds
        .map(cId => device?.capabilitiesObj[cId])
        .filter(c => c !== undefined) as CapabilityObj[] :
        [];

    $: flatDevices = Object.values($devices).sort((a, b) => {
        if(a.name === b.name) return 0;
        if(a.name < b.name) return -1;
        return 1;
    });
    $: flatCapabilities = device?.capabilitiesObj ? 
        Object.values(device.capabilitiesObj)
            .filter(c => !capabilityIds.includes(c.id))
            .sort((a, b) => {
                if(a.title === b.title) return 0;
                if(a.title < b.title) return -1;
                return 1;
            }) : 
        [];

    $: onDevice(deviceId);
    $: onCapability(selectedCapability);

    function onSettings(s: CapabilitySettings) {
        deviceId = s?.deviceId;
        capabilityIds = [ ...(s?.capabilityIds ?? []) ];
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

        capabilityIds.push(id!);
        dispatch('settings', { ...settings, capabilityIds });

        selectedCapability = undefined;
    }

    function moveUp(capabilityId: string) {
        const index = capabilityIds.indexOf(capabilityId);

        if(index < 1) {
            return;
        }

        const idPrevious = capabilityIds[index - 1];

        const copy = [...capabilityIds];
        copy[index - 1] = capabilityId;
        copy[index] = idPrevious;

        capabilityIds = copy;
        dispatch('settings', { ...settings, capabilityIds });
    }

    function moveDown(capabilityId: string) {
        const index = capabilityIds.indexOf(capabilityId);

        if(index == (capabilityIds.length - 1)) {
            return;
        }

        const idNext = capabilityIds[index + 1];

        const copy = [...capabilityIds];
        copy[index + 1] = capabilityId;
        copy[index] = idNext;

        capabilityIds = copy;
        dispatch('settings', { ...settings, capabilityIds });
    }

    function remove(capabilityId: string) {
        capabilityIds = capabilityIds.filter(cId => cId !== capabilityId);
        dispatch('settings', { ...settings, capabilityIds });
    }
</script>

<div>
    <Select bind:value={deviceId} label="Device" style="width: 100%;">
        {#each flatDevices as flatDevice}
          <Option value={flatDevice.id}>{flatDevice.name}</Option>
        {/each}
    </Select>
</div>

<div>
    {#if device}
        <Select bind:value={selectedCapability} label="Capability" style="width: 100%;">
            {#each flatCapabilities as capability}
                <Option value={capability.id}>{capability.title}</Option>
            {/each}
        </Select>
    {/if}
</div>

<div>
    <List dense>
        {#each capabilities as capability, i}
            <Item style="width: calc(100% - 4px); margin-left: 0px; padding-left: 4px;">
                <Text>{capability.title}</Text>
                <div style="flex-grow: 1"></div>

                {#if i > 0}
                    <IconButton size="button" class="material-icons" on:click={() => moveUp(capability.id)}>arrow_upward</IconButton>
                {/if}

                {#if i < (capabilities.length - 1)}
                    <IconButton size="button" class="material-icons" on:click={() => moveDown(capability.id)}>arrow_downward</IconButton>
                {:else}
                    <IconButton size="button" class="material-icons"></IconButton>
                {/if}

                <IconButton size="button" class="material-icons" on:click={() => remove(capability.id)}>delete</IconButton>
            </Item>
        {/each}
    </List>
</div>