<script lang="ts">
    import type { ToggleSettings_v1 } from './ToggleSettings';
    import type { WidgetContext } from '$lib/types/Widgets';
    import type { DeviceMap, VariableMap } from '$lib/types/Homey';

    import { devices, variables, homey, baseUrl } from '$lib/stores/homey';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    import type { ValueWrapper } from '$lib/services/ValueWrapper';
    import { VariableWrapper } from '$lib/services/VariableWrapper';
    import { CapabilityWrapper } from '$lib/services/CapabilityWrapper';
    
    export let settings: ToggleSettings_v1;
    export let context: WidgetContext;

    let uri: string | undefined;
    let iconId: string | undefined;
    let iconUrl: string | undefined;
    
    let wrapper: ValueWrapper | undefined;
    let wrapperUri: string | undefined;

    let label: string | undefined;
    let checked: boolean = false;
    let readonly: boolean = false;
    let type: 'boolean' | 'number' | 'string' | 'enum' | undefined;

    $: disabled = readonly || context.readonly || context.editable;

    $: onSettings(settings);
    $: onUri(uri, $variables, $devices);

    function onSettings(_settings: ToggleSettings_v1) {
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
        const variable = _variables[variableId];

        if(variable === undefined) return;

        wrapper = new VariableWrapper(variable, $homey!.logic);
        wrapperUri = variable.uri;

        label = variable.name;
        iconId = 'variable';
        iconUrl = undefined;
        readonly = false;
        type = variable.type;

        onValue(wrapper.value);
        wrapper.onValue(onValue);
    }

    function getCapability(deviceId: string, capabilityId: string, _devices: DeviceMap) {
        const device = _devices[deviceId];

        if(device === undefined) return;

        const capability = device.capabilitiesObj[capabilityId];
        
        if(capability === undefined) return;

        wrapper = new CapabilityWrapper(device, capabilityId);
        wrapperUri = device.uri + ':' + capabilityId;

        label = capability.title;
        iconUrl = capability.iconObj?.url;
        iconId = undefined;
        readonly = !capability.setable;
        type = capability.type;
        
        onValue(wrapper.value);
        wrapper.onValue(onValue);
    }

    function onValue(_value: any) {
        if(type === 'boolean') {
            checked = _value as boolean;
        } else if(type === 'number') {
            checked = !!(_value as number)
        } else {
            checked = false;
            readonly = true;
        }
    }

    async function onChecked(_value: boolean) {
        if(wrapper !== undefined && wrapper.value !== _value) {
            await wrapper.setValue(_value);
        }
    }

</script>

<label class="label cursor-pointer flex flex-row items-center p-0">
    {#if settings.iconId !== undefined || iconId !== undefined}
        <span>
            <Icon data={getIcon(settings.iconId ?? iconId)} />
        </span>
    {:else if iconUrl !== undefined}
        {#await $baseUrl then url}
            <span>
                <img class="w-8 h-8 m-1 dark:invert" src={url + iconUrl} alt={iconId} />
            </span>
        {/await}
    {/if}

    <span class="flex-1 overflow-ellipsis">{settings.label ?? label ?? uri ?? 'Not configured'}</span>

    <input type="checkbox" class="toggle toggle-primary" {disabled} checked={checked} on:click={e => onChecked(!checked)} />
</label>