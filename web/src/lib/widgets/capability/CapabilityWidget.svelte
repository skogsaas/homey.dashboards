<script lang="ts">
    import { devices, scopes } from '$lib/stores/homey';

    import type { CapabilityEvent, CapabilityObj, DeviceObj } from '$lib/types/Homey';
    
    import Icon from '$lib/components/Icon.svelte'

    import Slider from './components/Slider.svelte';
    import Sensor from './components/Sensor.svelte';
    import Toggle from './components/Toggle.svelte';
    import Button from './components/Button.svelte';
    import Thermostat from './components/Thermostat.svelte';
    import Picker from './components/Picker.svelte';
    import type { CapabilitySettings_v5 } from './CapabilitySettings';
    import { getIcon } from '$lib/components/icons/utils';
    import type { GridItemLayout_v1 } from '$lib/types/Grid';
    
    export let gridItem: GridStackWidget;
    export let context: WidgetContext;
    export let settings: CapabilitySettings_v5;

    let deviceId: string = '';
    let capabilityId: string = '';

    let device: DeviceObj | undefined;
    let capability: CapabilityObj | undefined;

    let subscribedDevice: DeviceObj | undefined;

    $: onSettings(settings);

    $: device = $devices[deviceId];
    $: capability = device !== undefined && capabilityId !== undefined ? device.capabilitiesObj[capabilityId] : undefined;
    $: controllable = $scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.control');

    $: onDevice(device);

    function onSettings(s: CapabilitySettings_v5) {
        if(s.capabilityUri) {
            const segments = s.capabilityUri.split(':');
            deviceId = segments[2];
            capabilityId = segments[3];
        }
    }

    function onDevice(_device: DeviceObj) {
        // If the device changes, try to unsubscribe from events
        if(subscribedDevice !== undefined && subscribedDevice.off !== undefined) {
            subscribedDevice.off('capability', updateCapability);
        }

        if(_device !== undefined) {
            subscribedDevice = _device;

            if(subscribedDevice.on !== undefined) {
                subscribedDevice.on('capability', updateCapability);
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
            <Icon data={getIcon(settings.iconId)} />
        {/if}
    
        <div class="font-extralight overflow-hidden overflow-ellipsis whitespace-nowrap flex-grow">
            {settings.title ?? capability.title}
        </div>
        
        <svelte:component 
            this={getComponent(capability)} 
            {settings}
            {device}
            {capability} 
            {controllable}
        />
    </div>
{:else}
    <span class="w-full h-8 overflow-hidden overflow-ellipsis font-extralight">
        {#if settings.capabilityUri !== undefined}
            {#if capability === undefined}
                Capability not found
            {:else if device === undefined}
                Device not found
            {/if}
        {:else}
            Capability not configured
        {/if}
    </span>
{/if}
