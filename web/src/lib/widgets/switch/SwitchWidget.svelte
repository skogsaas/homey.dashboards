<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { SwitchSettings_v1, SwitchCase_v1 } from './SwitchSettings';

    import Widget from '$lib/widgets/Widget.svelte';
    import { devices, zones } from '$lib/stores/homey';
    import DndList from '$lib/components/DndList.svelte';
    import type { CapabilityEvent, CapabilityObj, DeviceObj, Emitter } from '$lib/types/Homey';
    
    export let context: WidgetContext;
    export let settings: SwitchSettings_v1;

    const dispatch = createEventDispatcher();

    let cases: SwitchCase_v1[];
    let selectedId: string | undefined;

    let watched: Emitter | undefined;
    
    let switchObj: any | undefined;
    let caseKey: string | undefined;

    let child: WidgetSettings_v1 | undefined;
    let children: WidgetSettings_v1[];

    $: onSettings(settings);
    $: selectCase(selectedId)
    $: dropDisabled = children.length > 0; // Only allow a single item as child

    function onSettings(_settings: SwitchSettings_v1) {
        caseKey = _settings.case;
        cases = _settings.cases ?? [];

        child = undefined;
        children = [];
        
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

    function onItems(_items: WidgetSettings_v1[]) {
        // Expect _items to only contain a single item
        if(_items.length === 0) {
            child = undefined;
            children = [];
        } else {
            child = _items[0];
            children = [child];
        }

        const index = cases.findIndex(c => c.id === selectedId);
        cases[index] = { ...cases[index], item: child };
        cases = [...cases];

        settings = { ...settings, cases };
        dispatch('settings', settings);
    }

    function updateWidget(_item: WidgetSettings_v1) {
        child = { ..._item };
        children = [child];

        const index = cases.findIndex(c => c.id === selectedId);
        cases[index] = { ...cases[index], item: child };
        cases = [...cases];

        settings = { ...settings, cases };
        dispatch('settings', settings);
    }

    function selectCase(_selectedId: string | undefined) {
        const selected = cases.find(c => c.id === _selectedId);

        child = selected?.item;
        children = child !== undefined ? [child] : [];
    }
</script>

{#if context.editable}
    <div class="tabs tabs-bordered bg-base-300">
        {#each cases as c}
            <button class="tab" class:tab-active={selectedId === c.id} on:click={e => (selectedId = c.id)}>
                <span class="text-secondary pr-1">{caseKey ?? ''}</span>
                <span class="italic">{c.operator ?? ''}</span>
                <span class="text-accent pl-1">{c.value ?? ''}</span>
            </button>
        {/each}
    </div>
    <DndList 
        items={children}
        on:items={e => onItems(e.detail)} 
        editable={context.editable}
        {dropDisabled}
        class="w-full min-h-[50px]"
        let:item
    >
        <Widget {context} settings={item} on:settings={e => updateWidget(e.detail)} />
    </DndList>
{:else if child !== undefined}
    <Widget {context} settings={child} />
{/if}