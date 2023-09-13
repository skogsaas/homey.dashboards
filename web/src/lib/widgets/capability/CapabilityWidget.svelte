<script lang="ts">
    import { devices, homey, scopes } from '$lib/stores/homey';

    import type CapabilitySettings from './CapabilitySettings';
    import type { CapabilityEvent, CapabilityObj, DeviceObj } from '$lib/types/Homey';
    
    import Slider from './components/Slider.svelte';
    import Sensor from './components/Sensor.svelte';
    import Toggle from './components/Toggle.svelte';
    import Button from './components/Button.svelte';

    export let settings: CapabilitySettings;

    let device: DeviceObj;
    let capabilities: CapabilityObj[] = [];

    $: latestDevice = $devices[settings.deviceId ?? ''];
    $: controllable = $scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.control');

    $: onDevice(latestDevice);

    function onDevice(d: DeviceObj) {
        if(device !== undefined) {
            d.off('capability', updateCapability);
        }

        if(d !== undefined) {
            device = d;
            
            capabilities = settings?.capabilityIds !== undefined ? 
                settings.capabilityIds.map(cId => device.capabilitiesObj[cId]) : 
                [];

            d.on('capability', updateCapability);
        }
    }

    function updateCapability(event: CapabilityEvent) {
        if(device !== undefined) {
            const capability = device.capabilitiesObj[event.capabilityId];

            if(capability !== undefined) {
                // Trigger an update
                capabilities = [...capabilities];
            }
        }
    }

    async function setCapabilityValue(capabilityId: string, value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId,
            value
        });
    }

    function getComponent(capability: CapabilityObj) {
        if(capability === undefined) 
        {
            return Sensor;
        }

        if(capability.setable) {
            switch(capability.type) {
                case 'boolean':
                    return capability.getable ? Toggle : Button;
                case 'number':
                    return Slider;
                case 'string': // TODO: Implement some kind of input for this
                default:
                    return Sensor;
            }
        }

        if(capability.getable) {
            switch(capability.type) {
                case 'boolean':
                case 'number':
                case 'string':
                default:
                    return Sensor;
            }
        }

        return Sensor;
    }
</script>

<div class="widget-header">
    {#if device == undefined}
        {#if settings?.deviceId !== undefined}
            <span>Error</span>
        {/if}
    {:else}
        {#await $homey.baseUrl}
            ...
        {:then url}
            <img class="device-icon widget-icon-theme" src={url + device?.iconObj.url} alt={device?.icon} />
        {/await}

        <span class="device-title">{device?.name}</span>
    {/if}
</div>

<div class="widget-body">
    {#if device === undefined}
        {#if settings.deviceId !== undefined}
            <span class="device-title">Device not found.</span>
        {/if}
    {:else}
        <div class="capabilities">
            {#each capabilities as capability}
                {#if capability !== undefined}
                    <div class="capability">
                        <span class="capability-title">{capability.title}</span>
                        <svelte:component this={getComponent(capability)} {capability} {controllable} on:value={e => setCapabilityValue(capability.id, e.detail)}></svelte:component>
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>

.widget-header {
    display: flex;
    flex-grow: 0;
    align-items: center;

    overflow: hidden;
    
    height: 48px;
}

.widget-body {
    display: flex;
    flex-grow: 1;
    align-items: flex-start;
}

.device-icon {
    width: 32px;
    height: 32px;
    margin: 4px;
}

.device-title {
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: calc(100% - 40px);
}

.capabilities {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.capability {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - 10px);
    padding-left: 5px;
    padding-right: 5px;
}

.capability-title {
    font-size: 14px;
    font-weight: lighter;
    text-overflow: ellipsis;
    max-width: calc(100% - 32 - 8);
}

.value {
    flex-grow: 1;
    align-self: center;
    text-align: center;
    margin: 0;
}
</style>