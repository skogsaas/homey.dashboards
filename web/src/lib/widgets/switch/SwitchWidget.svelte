<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { SwitchSettings_v1, SwitchCase_v1 } from './SwitchSettings';

    import Widget from '$lib/widgets/Widget.svelte';
    import { devices } from '$lib/stores/homey';
    import type { CapabilityEvent, DeviceObj, HomeyEmitter } from '$lib/types/Homey';
    import WidgetSingle from '$lib/components/WidgetSingle.svelte';
    
    export let context: WidgetContext;
    export let settings: SwitchSettings_v1;

    const dispatch = createEventDispatcher();

    let cases: SwitchCase_v1[];
    let selectedId: string | undefined;

    let watched: HomeyEmitter | undefined;
    
    let switchObj: any | undefined;
    let caseKey: string | undefined;
    let child: WidgetSettings_v1 | undefined;

    $: onSettings(settings);
    $: selectCase(selectedId);
    $: editable = context.editable && selectedId !== undefined;
    $: childContext = { ...context, editable };

    function onSettings(_settings: SwitchSettings_v1) {
        caseKey = _settings.case;
        cases = _settings.cases ?? [];
        child = undefined;
        
        if(_settings.switch !== undefined && _settings.switchArg !== undefined) {
            if(_settings.switch === 'capability') {
                const segments = _settings.switchArg.split(':');
                const deviceId = segments[2];
                const capabilityId = segments[3];

                const device = $devices[deviceId];
                
                if(device !== undefined) {
                    switchObj = device.capabilitiesObj[capabilityId];
                    device.on('capability', (e: any) => onCapability(e));

                    watched = device;
                } else {
                    switchObj = undefined;
                    watched = undefined;
                }
            } else if(_settings.switch === 'device') {
                const deviceId = _settings.switchArg;
                const device = $devices[deviceId];
                
                if(device !== undefined) {
                    device.on('update', (e: any) => onDevice(e));
                    switchObj = device;
                    watched = device;
                } else {
                    switchObj = undefined;
                    watched = undefined;
                }
            } else if(_settings.switch === 'variable') {
                // TODO
            } else if(_settings.switch === 'user') {
                // TODO
            }
        }

        matchCase();
    }

    function onCapability(event: CapabilityEvent) {
        if(settings.switchArg === undefined) return;

        const segments = settings.switchArg.split(':');
        const deviceId = segments[2];
        const capabilityId = segments[3];

        if(event.capabilityId !== capabilityId) return;

        const device = watched as DeviceObj;
        switchObj = device.capabilitiesObj[capabilityId];

        matchCase();
    }

    function onDevice(patch: any) {
        switchObj = switchObj;

        matchCase();
    }

    function matchCase() {
        if(context.editable) {
            if(selectedId === undefined && cases.length > 0) {
                selectedId = cases[0].id;
            }
        } else {
            if(switchObj === undefined || caseKey === undefined) {
                // TODO: Find whatever case is marked as "default", and return it.
                return;
            }

            const property = switchObj[caseKey];
            selectedId = cases.find(c => matchOperator(c, property))?.id;
        }

        selectCase(selectedId);
    }
    
    function matchOperator(_case: SwitchCase_v1, value: any) : boolean {
        switch(_case.operator) {
            case 'equal':
                return value == _case.value;
            case 'not-equal':
                return value != _case.value;
            case 'starts-with':
                return typeof(value) === 'string' && typeof(_case.value) === 'string' && (value as string).startsWith(_case.value);
            case 'ends-with':
                return typeof(value) === 'string' && typeof(_case.value) === 'string' && (value as string).endsWith(_case.value);
            case 'contains':
                return typeof(value) === 'string' && typeof(_case.value) === 'string' && (value as string).includes(_case.value);
            case 'less-than':
                return value < _case.value;
            case 'greater-than':
                return value > _case.value;
        }

        return false;
    }

    function updateItem(_item: WidgetSettings_v1 | undefined) {
        child = _item;

        const index = cases.findIndex(c => c.id === selectedId);
        cases[index] = { ...cases[index], item: child };
        cases = [...cases];

        settings = { ...settings, cases };
        dispatch('settings', settings);

        selectCase(selectedId);
    }

    function selectCase(_selectedId: string | undefined) {
        const selected = cases.find(c => c.id === _selectedId);

        child = selected?.item;
    }
</script>

{#if context.editable}
    <div class="tabs tabs-bordered bg-base-300">
        {#each cases as c}
            <button class="tab" class:tab-active={selectedId === c.id} on:click|stopPropagation={e => (selectedId = c.id)}>
                <span class="text-secondary pr-1">{caseKey ?? ''}</span>
                <span class="italic">{c.operator ?? ''}</span>
                <span class="text-accent pl-1">{c.value ?? ''}</span>
            </button>
        {/each}
    </div>

    <WidgetSingle
        id={settings.id}
        context={childContext}
        item={child}
        {updateItem}
        class="w-full"
    />
{:else if child !== undefined}
    <Widget context={context} settings={child} />
{/if}