<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SwitchSettings_v1, SwitchCase_v1 } from "./SwitchSettings";
    import { v4 as uuid } from 'uuid';

    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import VariablePicker from '$lib/components/VariablePicker.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { mdiInformation, mdiTrashCan } from '$lib/components/icons';
    import CapabilityCase from './cases/CapabilityCase.svelte';
    import DeviceCase from './cases/DeviceCase.svelte';
    import VariableCase from './cases/VariableCase.svelte';
    import UserCase from './cases/UserCase.svelte';
    
    export let settings: SwitchSettings_v1;

    const dispatch = createEventDispatcher();

    let switchType: 'capability' | 'variable' | 'device' | 'user' | undefined;
    let switchArg: any;
    let caseKey: string | undefined;
    let cases: SwitchCase_v1[];

    let selectedId: string | undefined;

    $: onSettings(settings);
    $: onChange(switchType, switchArg, caseKey, cases);

    function onSettings(_settings: SwitchSettings_v1) {
        switchType = _settings.switch;
        switchArg = _settings.switchArg;
        caseKey = _settings.case;
        cases = _settings.cases ?? [];
    }

    function onChange(
        _switch: any,
        _switchArg: any,
        _caseKey: string | undefined,
        _cases: SwitchCase_v1[]
    ) {
        if(_switch !== settings.switch ||
            _switchArg !== settings.switchArg ||
            _caseKey !== settings.case ||
            _cases !== settings.cases
        ) {
            settings = {
                ...settings,
                switch: _switch,
                switchArg: _switchArg,
                case: _caseKey,
                cases: _cases
            };

            dispatch('settings', settings);
        }
    }

    function addCase() {
        const c: SwitchCase_v1 = {
            id: uuid()
        }

        cases = [...cases, c];
    }

    function removeCase(index: number) {
        cases = cases.filter((a, i) => i !== index);
    }

    function updateCaseOperator(index: number, operator: any) {
        cases[index] = { ...cases[index], operator };
        cases = [...cases];
    }

    function updateCaseValue(index: number, value: any) {
        cases[index] = { ...cases[index], value };
        cases = [...cases];
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Switch by</span>
    </div>
    <select class="select w-full mt-4" bind:value={switchType} placeholder="Switch by">
        {#if switchType === undefined}
            <option value={undefined}></option>
        {/if}
        <option value="device">Device</option>
        <option value="capability">Capability</option>
        <option value="variable" disabled >⛔ Variable</option>
        <option value="user" disabled>⛔ User</option>
    </select>
</label>

{#if switchType === 'capability'}
    <CapabilityPicker bind:capabilityUri={switchArg} />

    {#if switchArg !== undefined}
        <label class="form-control w-full">
            <div class="label">
                <span class="label-text">Property</span>
            </div>
            <select class="select w-full" value={caseKey} on:change={e => (caseKey = e.currentTarget.value)} placeholder="property">
                {#if caseKey === undefined}
                    <option value={undefined}></option>
                {/if}
                <option value="id">id</option>
                <option value="type">type</option>
                <option value="gettable">gettable</option>
                <option value="settable">settable</option>
                <option value="value">value</option>
            </select>
        </label>
    {/if}
{:else if switchType === 'variable'}
    <VariablePicker bind:variableId={switchArg} />
{:else if switchType === 'device'}
    <DevicePicker bind:deviceId={switchArg} />

    {#if switchArg !== undefined}
        <label class="form-control w-full">
            <div class="label">
                <span class="label-text">Property</span>
            </div>
            <select class="select w-full" value={caseKey} on:change={e => (caseKey = e.currentTarget.value)} placeholder="property">
                <option value="class">class</option>
                <option value="uiIndicator">uiIndicator</option>
                <option value="available">available</option>
                <option value="ready">ready</option>
            </select>
        </label>
        
        {#if caseKey === 'class' || caseKey === 'uiIndicator'}
            <div role="alert" class="alert my-2">
                <Icon data={mdiInformation} />
                {#if caseKey === 'class'}
                    <span>A list of standard class IDs can be found in the <a class="link" href="https://apps-sdk-v3.developer.homey.app/tutorial-device-classes.html">Homey SDK reference</a>.</span>
                {:else}
                    <span>A list of standard capability IDs can be found in the <a class="link" href="https://apps-sdk-v3.developer.homey.app/tutorial-device-capabilities.html">Homey SDK reference</a>.</span>
                {/if}
            </div>
        {/if}
    {/if}
{:else if switchType === 'user'}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Property</span>
        </div>
        <select class="select w-full" value={caseKey} on:change={e => (caseKey = e.currentTarget.value)} placeholder="property">
            <option value="email">Email</option>
        </select>
    </label>
{/if}

{#if caseKey !== undefined}
    <div class="flex justify-center my-1">
        <button class="btn btn-primary mt-2" on:click={() => addCase()}>Add case</button>
    </div>

    {#each cases as c, index}
        <div class="collapse collapse-arrow bg-base-300 mt-2">
            <input type="radio" name="cases" bind:group={selectedId} value={c.id} />
            <div class="collapse-title text-lg font-medium">
                <span class="text-secondary">{caseKey ?? ''}</span>
                <span class="italic">{c.operator ?? ''}</span>
                <span class="text-accent">{c.value ?? ''}</span></div>
            <div class="collapse-content">
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">Operator</span>
                    </div>
                    <select class="select w-full" value={c.operator} on:change={e => updateCaseOperator(index, e.currentTarget.value)} placeholder="Where">
                        <option value="equal">Equal</option>
                        <option value="not-equal">Not equal</option>
                        <option value="starts-with">Starts with</option>
                        <option value="contains">Contains</option>
                        <option value="ends-with">Ends with</option>
                        <option value="less-than">Less than</option>
                        <option value="greater-than">Greater than</option>
                    </select>
                </label>

                {#if switchType === 'capability'}
                    <CapabilityCase property={caseKey} operator={c.operator} value={c.value} on:value={e => updateCaseValue(index, e.detail)} />
                {:else if switchType === 'device'}
                    <DeviceCase property={caseKey} value={c.value} on:value={e => updateCaseValue(index, e.detail)} />
                {:else if switchType === 'variable'}
                    <VariableCase operator={c.operator} value={c.value} on:value={e => updateCaseValue(index, e.detail)} />
                {:else if switchType === 'user'}
                    <UserCase value={c.value} on:value={e => updateCaseValue(index, e.detail)} />
                {/if}

                <button class="btn btn-warning btn-outline w-full mt-2" on:click={() => removeCase(index)}><Icon data={mdiTrashCan} />Remove</button>
            </div>
        </div>
    {/each}
{/if}