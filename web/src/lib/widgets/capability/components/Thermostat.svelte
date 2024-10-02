<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';

    import { mdiAlarm, mdiAlert, mdiArrowRight, mdiCheck } from '$lib/components/icons';
    import { editing } from '$lib/stores/editing';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import Icon from '$lib/components/Icon.svelte'
    import type { CapabilitySettings_v5 } from '../CapabilitySettings';
    
    const dispatcher = createEventDispatcher();

    export let settings: CapabilitySettings_v5;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'card'|'view';

    let targetValue: number;
    $: disabled = !controllable || $editing;

    $: postfix = capability.id.indexOf('.') > -1 ? capability.id.slice(capability.id.indexOf('.')) : '';

    $: measureTemperature = capability.id === ('measure_temperature' + postfix) ? capability : device.capabilitiesObj['measure_temperature' + postfix];
    $: targetTemperature = capability.id === ('target_temperature' + postfix) ? capability : device.capabilitiesObj['target_temperature' + postfix];
    $: thermostatMode = capability.id === ('thermostat_mode' + postfix) ? capability : device.capabilitiesObj['thermostat_mode' + postfix];

    $: onTargetTemperature(targetTemperature);
    $: onThermostatMode(thermostatMode);
    $: onTargetValue(targetValue);

    onMount(() => {
        onThermostatMode(thermostatMode);
    });

    function onTargetTemperature(c: CapabilityObj) {
        targetValue = c.value;
    }

    function onThermostatMode(c: CapabilityObj) {
        if(thermostatMode === undefined) {
            return;
        }

        if(c.value === 'cool') {
            dispatcher('style', 'bg-gradient-to-r from-cyan-400 to-cyan-600 border-none');
        } else if(c.value === 'heat') {
            dispatcher('style', 'bg-gradient-to-r from-orange-400 to-orange-600 border-none');
        } else if(c.value === 'auto') {
            dispatcher('style', 'bg-gradient-to-r from-cyan-400 to-orange-600 border-none');
        } else {
            dispatcher('style', '');
        }
        
    }

    function onTargetValue(v: number) {
        if(capability.setable &&  v !== capability?.value) {
            if(!disabled) {
                setCapabilityValue(capability.id, v);
            }
        }
    }

    async function setMode(value: string) {
        thermostatMode.value = value;
        await setCapabilityValue(thermostatMode.id, value);
    }

    async function setCapabilityValue(capabilityId: string, value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId,
            value
        });
    }
</script>

<span class="whitespace-nowrap">{capability.value ?? '...'} {capability.units ?? ''}</span>