<script lang="ts">
    import type { CapabilityEvent, CapabilityObj, DeviceObj, Variable } from '$lib/types/Homey';
    import type { WidgetContext } from '$lib/types/Widgets';

    import type { SliderSettings_v3 } from './SliderSettings';

    import { devices, variables, homey } from '$lib/stores/homey';
    
    export let settings: SliderSettings_v3;
    export let context: WidgetContext;

    let uri: string | undefined;
    
    let labelPosition: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
    let labelSize: 'text-xs' | 'text-sm' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl' | 'text-7xl' | 'text-8xl' | 'text-9xl' | undefined;
    
    let valuePosition: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
    let valueSize: 'text-xs' | 'text-sm' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl' | 'text-7xl' | 'text-8xl' | 'text-9xl' | undefined;

    let device: DeviceObj | undefined;
    let capability: CapabilityObj | undefined;

    let variable: Variable | undefined;

    let value: number;

    let label: string | undefined;
    let min: number;
    let max: number;
    let step: number | undefined;
    let decimals: number | undefined;
    let unit: string;
    let readonly: boolean = false;

    $: disabled = readonly || context.readonly || context.editable;

    $: onSettings(settings);
    $: onUri(uri);
    $: onValue(value);

    function onSettings(_settings: SliderSettings_v3) {
        if(_settings.uri !== uri) {
            uri = _settings.uri;
        }

        labelPosition = _settings.labelPosition ?? 'left';
        labelSize = _settings.labelSize;

        valuePosition = _settings.valuePosition ?? 'right';
        valueSize = _settings.valueSize;
    }

    function onUri(_uri: string | undefined) {
        if(_uri !== undefined) {
            const segments = _uri.split(':');

            if(device !== undefined) {
                device.off('capability', onCapability);
                device = undefined;
                capability = undefined;
            }

            if(variable !== undefined) {
                variable.off('update', onVariable);
                variable = undefined;
            }

            if(segments[1] === 'variable') {
                getVariable(segments[2]);
            } else if (segments[1] === 'device' && segments.length === 4) {
                getCapability(segments[2], segments[3]);
            }
            // TODO: Flow token
        }
    }

    function getVariable(variableId: string) {
        variable = $variables[variableId];

        if(variable === undefined) return;

        label = variable.name;
        decimals = 0;
        unit = '';
        readonly = false;

        if(variable.type === 'boolean') {
            value = Number(variable.value);
            min = 0; 
            max = 1;
            step = 1;
        } else if(variable.type === 'number') {
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

        variable.on('update', onVariable);
    }

    function onVariable() {
        if(variable === undefined) return;

        if(variable.type === 'boolean') {
            value = variable.value as number;
        } else if(variable.type === 'number') {
            value = variable.value as number
        } else {
            value = 0;
        }
    }

    function getCapability(deviceId: string, capabilityId: string) {
        device = $devices[deviceId];

        if(device === undefined) return;

        capability = device.capabilitiesObj[capabilityId];

        if(capability === undefined) return;

        label = capability.title;
        decimals = capability.decimals ?? 0;
        unit = capability.units;
        readonly = !capability.setable;
        
        if(capability.type === 'boolean') {
            value = Number(capability.value);
            min = 0; 
            max = 1;
            step = 1;
        } else if(capability.type === 'number') {
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

        device.on('capability', (e: any) => onCapability(capabilityId, e));
    }

    function onCapability(capabilityId: string, event: CapabilityEvent) {
        if(event.capabilityId !== capabilityId) return;

        if(capability === undefined) return;

        if(capability.type === 'boolean') {
            value = Number(capability.value);
        } else if(capability.type === 'number') {
            value = capability.value as number
        } else {
            value = 0;
            readonly = true;
        }
    }

    async function onValue(_value: number) {
        if(device !== undefined && capability !== undefined) {
            if(_value !== capability.value && !disabled) {
                await device.setCapabilityValue({ 
                    deviceId: device.id,
                    capabilityId: capability.id,
                    value: _value
                });
            }
        } else if (variable !== undefined) {
            if(_value !== variable.value && !disabled) {
                await $homey.logic.updateVariable({
                    id: variable.id,
                    variable: { value: _value }
                })
            }
        }
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

    async function setCapabilityValue(_value: number|boolean|string) {
        if(device && capability) {
            await device.setCapabilityValue({ 
                deviceId: device.id,
                capabilityId: capability.id,
                value: _value
            });
        }
    }
</script>

<div class="flex flex-col w-full h-full px-1">
    {#if valuePosition === 'top'}
        <span class="w-full text-center {valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
    {/if}

    {#if labelPosition === 'top'}
        <span class="w-full text-center {labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
    {/if}

    <div class="flex flex-row mt-2 gap-1">
        {#if labelPosition === 'left'}
            <span class="whitespace-nowrap {labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
        {/if}
        
        {#if valuePosition === 'left'}
            <span class="whitespace-nowrap {valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
        {/if}

        {#if labelPosition !== 'left' && valuePosition !== 'left' && !settings.hideMinMax}
            <span class="whitespace-nowrap">{formatValue(settings.min ?? min)} {settings.unit ?? unit ?? ''}</span>
        {/if}

        <div class="h-full flex-grow">
            <input
                type="range"
                class="range"
                bind:value={value}
                min={settings.min ?? min} 
                max={settings.max ?? max} 
                step={getStep()}
                disabled={disabled} 
            />
        </div>
        
        {#if valuePosition === 'right'}
            <span class="whitespace-nowrap {valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
        {/if}

        {#if labelPosition === 'right'}
            <span class="whitespace-nowrap {labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
        {/if}

        {#if valuePosition !== 'right' && labelPosition !== 'right' && !settings.hideMinMax}
            <span class="whitespace-nowrap">{formatValue(settings.max ?? max)} {settings.unit ?? unit ?? ''}</span>
        {/if}
    </div>

    {#if labelPosition === 'bottom'}
        <span class="w-full text-center {labelSize ?? ''}">{settings?.label ?? label ?? 'Not configured'}</span>
    {/if}

    {#if valuePosition === 'bottom'}
        <span class="w-full text-center {valueSize ?? ''}">{formatValue(value) ?? ''} {settings.unit ?? unit ?? ''}</span>
    {/if}
</div>