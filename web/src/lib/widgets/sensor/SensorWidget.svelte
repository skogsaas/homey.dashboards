<script lang="ts">
    import type { SensorSettings_v1 } from './SensorSettings';
    import type { WidgetContext } from '$lib/types/Widgets';
    import type { DeviceMap, VariableMap } from '$lib/types/Homey';
    import type { ValueWrapper } from '$lib/services/ValueWrapper';
    import { VariableWrapper } from '$lib/services/VariableWrapper';
    import { CapabilityWrapper } from '$lib/services/CapabilityWrapper';

    import { devices, variables, homey, baseUrl } from '$lib/stores/homey';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    
    export let settings: SensorSettings_v1;
    export let context: WidgetContext;

    let uri: string | undefined;
    let iconId: string | undefined;
    let iconUrl: string | undefined;

    let wrapper: ValueWrapper | undefined;
    let wrapperUri: string | undefined;

    let label: string | undefined;
    let value: any;
    let values: { id: string, title: string }[];
    let unit: string | undefined;
    let type: 'boolean' | 'number' | 'string' | 'enum' | undefined;

    $: onSettings(settings);
    $: onUri(uri, $variables, $devices);

    function onSettings(_settings: SensorSettings_v1) {
        if(_settings.uri !== uri) {
            uri = _settings.uri;
        }
    }

    function onUri(
        _uri: string | undefined,
        _variables: VariableMap,
        _devices: DeviceMap
    ) {
        if(_uri !== undefined && _uri !== wrapperUri) {
            const segments = _uri.split(':');

            // First do some cleanup from previous URI
            if(wrapper !== undefined && wrapper) {
                wrapper.destroy();
                wrapper = undefined;
                wrapperUri = undefined;
            }

            if(segments[1] === 'variable') {
                getVariable(segments[2], _variables);
            } else if (segments[1] === 'device' && segments.length === 4) {
                getCapability(segments[2], segments[3], _devices);
            }
            // TODO: Flow token
        }
    }

    function getVariable(variableId: string, _variables: VariableMap) {
        const variable = $variables[variableId];

        if(variable === undefined) return;

        wrapper = new VariableWrapper(variable, $homey!.logic);
        wrapperUri = variable.uri;

        label = variable.name;
        value = variable.value;
        values = [];
        type = variable.type;
        unit = undefined;
        iconId = 'variable';
        iconUrl = undefined;

        type = variable.type;

        onValue(wrapper.value);
        wrapper.onValue(onValue);
    }

    function getCapability(deviceId: string, capabilityId: string, _devices: DeviceMap) {
        const device = $devices[deviceId];

        if(device === undefined) return;

        const capability = device.capabilitiesObj[capabilityId];

        if(capability === undefined) return;

        wrapper = new CapabilityWrapper(device, capabilityId);
        wrapperUri = device.uri + ':' + capabilityId;

        label = capability.title;
        value = capability.value;
        type = capability.type;
        unit = capability.units;
        iconUrl = capability.iconObj?.url;
        iconId = undefined;

        if(type === 'enum') {
            value = capability.values.find(v => v.id === value)?.title ?? value
        }
        
        onValue(wrapper.value);
        wrapper.onValue(onValue);
    }

    function onValue(_value: any) {
        if(type !== 'enum') {
            value = _value;
        } else {
            value = values.find(v => v.id === value)?.title ?? _value
        }
    }

</script>

<div class="flex flex-row items-center">
    <span>
        {#if settings.iconId !== undefined || iconId !== undefined}
            <Icon data={getIcon(settings.iconId ?? iconId)} />
        {:else if iconUrl !== undefined}
            {#await $baseUrl then url}
                <img class="w-8 h-8 m-1 dark:invert" src={url + iconUrl} alt={iconUrl} />
            {/await}
        {/if}
    </span>

    <span class="flex-1 overflow-ellipsis">{settings.label ?? label ?? uri ?? 'Not configured'}</span>

    <span>
        {#if type === 'boolean'}
            <span>{value ? 'Yes' : 'No'}</span>
        {:else}
            <span class="whitespace-nowrap">{value ?? '...'} {unit ?? ''}</span>
        {/if}
    </span>
</div>