<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    import { devices, homey } from '$lib/stores/homey';

    // UI elements
    import DevicePicker from '$lib/components/DevicePicker.svelte';

    // Tailwind
    import Divider from "stwui/divider";
    import List from "stwui/list";
    import Button from 'stwui/button';

    import type CapabilitySettings from "./CapabilitySettings";
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import { mdiArrowDown, mdiArrowUp, mdiDelete } from '$lib/components/icons';

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

    $: flatDevices = Object.values($devices);
    $: flatCapabilities = (device?.capabilitiesObj ? Object.values(device.capabilitiesObj) : [])
            .filter(c => !capabilityIds.includes(c.id))
            .sort((a, b) => {
                if(a.title === b.title) return 0;
                if(a.title < b.title) return -1;
                return 1;
            });

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
                    {#await $homey.baseUrl then url}
                        {#if capability.iconObj?.url}
                            <img src={url + capability.iconObj.url} alt={capability.title} class="h-6 w-6 mr-2" />
                        {/if}
                    {/await}
                    <div class="my-auto">{capability.title}</div>
                    <div style="flex-grow: 1"></div>

                    {#if i > 0}
                        <Button shape="circle" on:click={() => moveUp(capability.id)}>
                            <Button.Icon data={mdiArrowUp} />
                        </Button>
                    {/if}

                    {#if i < (capabilities.length - 1)}
                        <Button shape="circle" on:click={() => moveDown(capability.id)}>
                            <Button.Icon data={mdiArrowDown} />
                        </Button>
                    {:else}
                        <Button shape="circle"></Button>
                    {/if}

                    <Button shape="circle" on:click={() => remove(capability.id)}>
                        <Button.Icon data={mdiDelete} />
                    </Button>
                </List.Item>
            {/each}
        </List>
    </div>
{/if}