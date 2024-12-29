<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { SensorSettings_v1 } from './SensorSettings';
    
    import EntityPicker from '$lib/components/entity-picker/EntityPicker.svelte';

    import IconPicker from '$lib/components/IconPicker.svelte';
    import TextPicker from '$lib/components/TextPicker.svelte';
    import type { CapabilityObj, DeviceObj, Variable } from '$lib/types/Homey';

    const dispatch = createEventDispatcher();
    
    export let settings: SensorSettings_v1;

    let uri: string | undefined;
    let label: string | undefined;
    let iconId: string | undefined;

    let item: any | undefined;

    $: onSettings(settings);
    $: onChange(uri, label, iconId);

    function onSettings(s: SensorSettings_v1) {
        uri = s?.uri;
        label = s?.label;
        iconId = s?.iconId;
    }

    function onChange(
        _uri: string | undefined, 
        _label: string | undefined, 
        _iconId: string | undefined
    ) {
        if(_uri !== settings.uri || 
            _label !== settings.label ||
            _iconId !== settings.iconId
        ) {
            settings = { 
                ...settings, 
                uri: _uri,
                label: _label === '' ? undefined : _label,
                iconId: _iconId
            };

            dispatch('settings', settings);
        }
    }

    function variableFilter(variable: Variable) : boolean {
        return true;
    }

    function capabilityFilter(device: DeviceObj, capability: CapabilityObj) : boolean {
        return capability.getable === true;
    }
</script>

<EntityPicker bind:uri={uri} on:item={(e) => (item = e.detail)} {variableFilter} {capabilityFilter} label="Item" />
<TextPicker bind:value={label} placeholder={item?.title ?? 'Label'} label="Label" />
<IconPicker bind:iconId={iconId} />