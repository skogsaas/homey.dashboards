<script lang="ts">
    import type { CapabilityEvent, CapabilityObj, DeviceMap, DeviceObj, Variable, VariableMap } from '$lib/types/Homey';
    import type { WidgetContext } from '$lib/types/Widgets';

    import type { SliderSettings_v3 } from './SliderSettings';

    import { devices, variables, homey } from '$lib/stores/homey';
    import type { ValueWrapper } from '$lib/services/ValueWrapper';
    import { VariableWrapper } from '$lib/services/VariableWrapper';
    import { CapabilityWrapper } from '$lib/services/CapabilityWrapper';
    
    export let settings: SliderSettings_v3;
    export let context: WidgetContext;

    let uri: string | undefined;

    let wrapper: ValueWrapper | undefined;
    let wrapperUri: string | undefined;

    let value: number;

    let label: string | undefined;
    let min: number;
    let max: number;
    let step: number | undefined;
    let decimals: number | undefined;
    let unit: string;
    let readonly: boolean = false;
    let type: 'boolean' | 'number' | 'string' | 'enum' | undefined;

    $: disabled = readonly || context.readonly || context.editable;

    $: onSettings(settings);
    $: onUri(uri, $variables, $devices);

    function onSettings(_settings: SliderSettings_v3) {
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
        decimals = 0;
        unit = '';
        readonly = false;
        type = variable.type;

        if(type === 'boolean') {
            value = Number(variable.value);
            min = 0; 
            max = 1;
            step = 1;
        } else if(type === 'number') {
            value = variable.value as number;
            min = 0; 
            max = 100;
            step = 1;
        } else {
            value = 0;

            min = 0; 
            max = 100;
            step = 1;
            readonly = true;
        }

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
        decimals = capability.decimals ?? 0;
        unit = capability.units;
        readonly = !capability.setable;
        type = capability.type;

        if(type === 'boolean') {
            value = Number(capability.value);
            min = 0; 
            max = 1;
            step = 1;
        } else if(type === 'number') {
            value = capability.value as number;
            min = capability.min ?? 0; 
            max = capability.max ?? 100;
            step = capability.step;
        } else {
            value = 0;
            min = 0; 
            max = 100;
            step = 1;
            readonly = true;
        }

        onValue(wrapper.value);
        wrapper.onValue(onValue);
    }

    function onValue(_value: any) {
        if(type === 'boolean') {
            value = _value as number;
        } else if(type === 'number') {
            value = _value as number
        } else {
            value = 0;
        }
    }

    async function onSlider(e: any) {
        const _value = e.target.value;
        
        await wrapper?.setValue(_value);
    }

    function formatValue(_value: number | null | undefined) : string {
        if(_value === null || _value === undefined) {
            return '';
        }

        _value = Number(_value);

        const _unit = settings.unit ?? unit ?? '';
        const _min = settings.min ?? min;
        const _max = settings.max ?? max;
        const _decimals = settings.decimals ?? decimals;

        if(_unit === '%') {
            return (100.0 / (_max - _min) * _value).toFixed(_decimals);
        }

        return _value.toFixed(_decimals);
    }

    function getStep() : number {
        let _step = settings.step ?? step;

        if(_step !== undefined) {
            return _step;
        }

        // If no step is defined, use number of decimals to determine max step size.
        const _decimals = settings.decimals ?? decimals;
        return Math.pow(0.1, _decimals ?? 0);
    }
</script>

<div class="flex flex-col w-full">
    {#if settings.valuePosition === 'top'}
        <span class="w-full text-center {settings.valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
    {/if}

    {#if settings.labelPosition === 'top'}
        <span class="w-full text-center {settings.labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
    {/if}

    <div class="flex flex-row mt-2 gap-1">
        {#if settings.labelPosition === 'left'}
            <span class="whitespace-nowrap {settings.labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
        {/if}
        
        {#if settings.valuePosition === 'left'}
            <span class="whitespace-nowrap {settings.valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
        {/if}

        {#if settings.labelPosition !== 'left' && settings.valuePosition !== 'left' && !settings.hideMinMax}
            <span class="whitespace-nowrap">{formatValue(settings.min ?? min)} {settings.unit ?? unit ?? ''}</span>
        {/if}

        <div class="h-full flex-grow">
            <input
                type="range"
                class="range"
                value={value}
                on:change={e => onSlider(e)}
                min={settings.min ?? min} 
                max={settings.max ?? max} 
                step={getStep()}
                disabled={disabled} 
            />
        </div>
        
        {#if settings.valuePosition === 'right'}
            <span class="whitespace-nowrap {settings.valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
        {/if}

        {#if settings.labelPosition === 'right'}
            <span class="whitespace-nowrap {settings.labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
        {/if}

        {#if settings.valuePosition !== 'right' && settings.labelPosition !== 'right' && !settings.hideMinMax}
            <span class="whitespace-nowrap">{formatValue(settings.max ?? max)} {settings.unit ?? unit ?? ''}</span>
        {/if}
    </div>

    {#if settings.labelPosition === 'bottom'}
        <span class="w-full text-center {settings.labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
    {/if}

    {#if settings.valuePosition === 'bottom'}
        <span class="w-full text-center {settings.valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
    {/if}
</div>