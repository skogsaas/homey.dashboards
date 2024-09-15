<script lang="ts">
    import type { SensorSettings_v1 } from './SensorSettings';
    import type { WidgetContext } from '$lib/types/Widgets';
    import type { CapabilityEvent, CapabilityObj, DeviceObj, Variable } from '$lib/types/Homey';

    import { devices, variables, homey } from '$lib/stores/homey';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    
    export let settings: SensorSettings_v1;
    export let context: WidgetContext;

    let uri: string | undefined;
    let iconId: string | undefined;
    let iconUrl: string | undefined;

    let device: DeviceObj | undefined;
    let capability: CapabilityObj | undefined;

    let variable: Variable | undefined;

    let label: string | undefined;
    let value: any;
    let type: 'boolean' | 'number' | 'string' | 'enum';
    let unit: string | undefined;

    $: onSettings(settings);
    $: onUri(uri);

    function onSettings(_settings: SensorSettings_v1) {
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
        value = variable.value;
        type = variable.type;
        unit = undefined;
        iconId = 'variable';
        iconUrl = undefined;

        variable.on('update', onVariable);
    }

    function onVariable() {
        if(variable === undefined) return;

        value = variable.value;
    }

    function getCapability(deviceId: string, capabilityId: string) {
        device = $devices[deviceId];

        if(device === undefined) return;

        capability = device.capabilitiesObj[capabilityId];

        if(capability === undefined) return;

        label = capability.title;
        value = capability.value;
        type = capability.type;
        unit = capability.units;
        iconUrl = capability.iconObj?.url;
        iconId = undefined;

        if(type === 'enum') {
            value = capability.values.find(v => v.id === value)?.title ?? value
        }
        
        device.on('capability', (e: any) => onCapability(capabilityId, e));
    }

    function onCapability(capabilityId: string, event: CapabilityEvent) {
        if(event.capabilityId !== capabilityId) return;

        if(capability === undefined) return;
        
        value = capability.value;

        if(type === 'enum') {
            value = capability.values.find(v => v.id === value)?.title ?? value
        }
    }

</script>

<div class="flex flex-row items-center gap-1">
    <span>
        {#if settings.iconId !== undefined || iconId !== undefined}
            <Icon data={getIcon(settings.iconId ?? iconId)} />
        {:else if iconUrl !== undefined}
            {#await $homey.baseUrl then url}
                <img class="w-8 h-8 m-1 dark:invert" src={url + device?.iconObj.url} alt={device?.icon} />
            {/await}
        {/if}
    </span>

    <span class="flex-1 overflow-ellipsis">{settings.label ?? label ?? uri ?? 'Not configured'}</span>

    <span>
        {#if type === 'boolean'}
            <span>{value ? 'Yes' : 'No'}</span>
        {:else}
            <span class="whitespace-nowrap">{value ?? '...'} {capability?.units ?? ''}</span>
        {/if}
    </span>
</div>