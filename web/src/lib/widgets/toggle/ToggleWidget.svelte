<script lang="ts">
    import type { ToggleSettings_v1 } from './ToggleSettings';
    import type { WidgetContext } from '$lib/types/Widgets';
    import type { CapabilityEvent, CapabilityObj, DeviceObj, Variable } from '$lib/types/Homey';

    import { devices, variables, homey } from '$lib/stores/homey';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    
    export let settings: ToggleSettings_v1;
    export let context: WidgetContext;

    let uri: string | undefined;
    let iconId: string | undefined;
    let iconUrl: string | undefined;

    let device: DeviceObj | undefined;
    let capability: CapabilityObj | undefined;

    let variable: Variable | undefined;

    let label: string | undefined;
    let checked: boolean = false;
    let readonly: boolean = false;

    $: disabled = readonly || context.readonly || context.editable;

    $: onSettings(settings);
    $: onUri(uri);
    $: onChecked(checked);

    function onSettings(_settings: ToggleSettings_v1) {
        if(_settings.uri !== uri) {
            uri = _settings.uri;
        }
    }

    function onUri(_uri: string | undefined) {
        if(_uri !== undefined) {
            const segments = _uri.split(':');

            if(capability !== undefined) {
                capability.off('update', onCapability);
                capability = undefined;
                device = undefined;
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
        iconId = 'variable';
        iconUrl = undefined;
        readonly = false;

        if(variable.type === 'boolean') {
            checked = variable.value as boolean;
        } else if(variable.type === 'number') {
            checked = !!(variable.value as number)
        } else if(variable.type === 'string') {
            checked = false;
            readonly = true;
        }

        variable.on('update', onVariable);
    }

    function onVariable() {
        if(variable === undefined) return;

        if(variable.type === 'boolean') {
            checked = variable.value as boolean;
        } else if(variable.type === 'number') {
            checked = !!(variable.value as number)
        } else {
            checked = false;
        }
    }

    function getCapability(deviceId: string, capabilityId: string) {
        device = $devices[deviceId];

        if(device === undefined) return;

        capability = device.capabilitiesObj[capabilityId];

        if(capability === undefined) return;

        label = capability.title;
        iconUrl = capability.iconObj?.url;
        iconId = undefined;
        readonly = !capability.setable;
        
        if(capability.type === 'boolean') {
            checked = capability.value as boolean;
        } else if(capability.type === 'number') {
            checked = !!(capability.value as number)
        } else {
            checked = false;
            readonly = true;
        }

        device.on('capability', (e: any) => onCapability(capabilityId, e));
    }

    function onCapability(capabilityId: string, event: CapabilityEvent) {
        if(event.capabilityId !== capabilityId) return;

        if(capability === undefined) return;

        if(capability.type === 'boolean') {
            checked = capability.value as boolean;
        } else if(capability.type === 'number') {
            checked = !!(capability.value as number)
        } else {
            checked = false;
            readonly = true;
        }
    }

    async function onChecked(_value: boolean) {
        if(device !== undefined && capability !== undefined) {
            if(_value !== capability.value && !disabled) {
                await device.setCapabilityValue({ 
                    deviceId: device.id,
                    capabilityId: capability.id,
                    value: checked
                });
            }
        } else if (variable !== undefined) {
            if(_value !== variable.value && !disabled) {
                await $homey.logic.updateVariable({
                    id: variable.id,
                    variable: { value: checked }
                })
            }
        }
    }

</script>

<label class="label cursor-pointer flex flex-row items-center p-0">
        {#if settings.iconId !== undefined || iconId !== undefined}
            <span>
                <Icon data={getIcon(settings.iconId ?? iconId)} />
            </span>
        {:else if iconUrl !== undefined}
            {#await $homey.baseUrl then url}
                <span>
                    <img class="w-8 h-8 m-1 dark:invert" src={url + device?.iconObj.url} alt={device?.icon} />
                </span>
            {/await}
        {/if}

    <span class="flex-1 overflow-ellipsis">{settings.label ?? label ?? uri ?? 'Not configured'}</span>

    <input type="checkbox" class="toggle" {disabled} bind:checked={checked} />
</label>