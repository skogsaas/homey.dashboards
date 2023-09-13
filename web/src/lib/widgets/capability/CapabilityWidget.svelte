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
            <img class="w-8 h-8 m-1" src={url + device?.iconObj.url} alt={device?.icon} />
        {/await}

        <span class="w-full overflow-hidden overflow-ellipsis">{device?.name}</span>
    {/if}
</div>

<div class="flex flex-grow">
    {#if device === undefined}
        {#if settings.deviceId !== undefined}
            <span class="w-full overflow-hidden overflow-ellipsis">Device not found.</span>
        {/if}
    {:else}
        <div class="flex flex-col w-full">
            {#each capabilities as capability}
                {#if capability !== undefined}
                    <div class="flex items-center justify-between w-full pl-1 pr-1">
                        <div class="font-extralight overflow-clip overflow-ellipsis whitespace-nowrap">{capability.title}</div>
                        <svelte:component 
                            this={getComponent(capability)} 
                            {capability} 
                            {controllable} 
                            on:value={e => setCapabilityValue(capability.id, e.detail)}
                        />
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

.device-icon {
    width: 32px;
    height: 32px;
    margin: 4px;
}
</style>