<script lang="ts">
    import { devices, scopes } from '$lib/stores/homey';

    import type { CapabilityEvent, CapabilityObj, DeviceObj } from '$lib/types/Homey';
    
    import Icon from 'stwui/icon';

    import Slider from './components/Slider.svelte';
    import Sensor from './components/Sensor.svelte';
    import Toggle from './components/Toggle.svelte';
    import Button from './components/Button.svelte';
    import Thermostat from './components/Thermostat.svelte';
    import Picker from './components/Picker.svelte';
    import type { CapabilitySettings_v4 } from './CapabilitySettings';
    import { getIcon } from '$lib/components/icons/utils';
    
    export let settings: CapabilitySettings_v4;
    export let mode: 'card'|'view';    

    let deviceId: string = '';
    let capabilityId: string = '';

    let device: DeviceObj | undefined;
    let capability: CapabilityObj | undefined;

    $: onSettings(settings);

    $: latestDevice = $devices[deviceId];
    $: capability = latestDevice && capabilityId ? latestDevice.capabilitiesObj[capabilityId] : undefined;
    $: controllable = $scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.control');

    $: onDevice(latestDevice);

    function onSettings(s: CapabilitySettings_v4) {
        deviceId = s.deviceId ?? '';
        capabilityId = s.capabilityId ?? '';
    }

    function onDevice(d: DeviceObj) {
        // If the device changes, try to unsubscribe from events
        if(device !== undefined && device.off !== undefined) {
            device.off('capability', updateCapability);
        }

        if(d !== undefined) {
            device = d;

            if(device.on !== undefined) {
                device.on('capability', updateCapability);
            }
        }
    }

    function updateCapability(event: CapabilityEvent) {
        if(device !== undefined && event.capabilityId === capabilityId) {
            capability = device.capabilitiesObj[event.capabilityId];
        }
    }

    function getComponent(capability: CapabilityObj) {
        if(device !== undefined) {
            for(var component of device.ui.components) {
                if(component.capabilities.includes(capability.id)) {
                    switch(component.id) {
                        case 'slider':
                            return Slider;

                        case 'toggle':
                            return Toggle;

                        case 'button':
                            return Button;

                        case 'thermostat':
                            return Thermostat;

                        case 'picker':
                            return Picker;

                        case 'battery':
                        case 'color':
                        case 'media':                        
                        case 'ternary':
                        case 'sensor':
                        default:
                            return Sensor;
                    }
                }
            }
        }

        return Sensor;
    }
</script>

{#if device !== undefined && capability !== undefined}
    <div class="flex items-center justify-between w-full pl-1 pr-1 leading-normal cursor-pointer">
        {#if settings.iconId !== undefined}
            <Icon data={getIcon(settings.iconId)} class="mr-1" />
        {/if}

        {#if mode === 'card'}
            <div class="font-extralight overflow-hidden overflow-ellipsis whitespace-nowrap flex-grow">
                {settings.title ?? capability.title}
            </div>
        {/if}
        
        <svelte:component 
            this={getComponent(capability)} 
            {settings}
            {device}
            {capability} 
            {controllable}
            {mode}
        />
    </div>
{:else}
    <span class="w-full h-8 overflow-hidden overflow-ellipsis font-extralight">
        {#if device === undefined && settings.deviceId !== undefined}
            Device not found
        {:else if capability === undefined && settings.capabilityId !== undefined}
            Capability not found
        {:else}
            Capability not configured
        {/if}
    </span>
{/if}
