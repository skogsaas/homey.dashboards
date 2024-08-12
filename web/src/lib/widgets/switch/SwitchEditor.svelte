<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SwitchSettings_v1, SwitchCase_v1 } from "./SwitchSettings";
    import { v4 as uuid } from 'uuid';

    import TextPicker from '$lib/components/TextPicker.svelte';
    import NumberPicker from '$lib/components/NumberPicker.svelte';
    import BooleanPicker from '$lib/components/BooleanPicker.svelte';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import IconPicker from '$lib/components/IconPicker.svelte';
    import VariablePicker from '$lib/components/VariablePicker.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { mdiInformation } from '$lib/components/icons';
    
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

    function updateCaseOperator(index: number, operator: any) {
        cases[index] = { ...cases[index], operator };
    }

    function updateCaseValue(index: number, value: any) {
        cases[index] = { ...cases[index], value };
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Switch by</span>
    </div>
    <select class="select w-full mt-4" bind:value={switchType} placeholder="Switch by">
        <option value="capability">Capability</option>
        <option value="variable">Variable</option>
        <option value="device">Device</option>
        <option value="user">User</option>
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
                <option value="id">ID</option>
                <option value="type">Type</option>
                <option value="value">Value</option>
            </select>
        </label>
        
        {#if caseKey === 'id'}
            <div role="alert" class="alert my-2">
                <Icon data={mdiInformation} />
                <span>A list of standard capability IDs can be found in the <a class="link" href="https://apps-sdk-v3.developer.homey.app/tutorial-device-capabilities.html">Homey SDK reference</a>.</span>
            </div>
        {/if}
    {/if}
{:else if switchType === 'variable'}
    <VariablePicker bind:variableId={switchArg} />
{:else if switchType === 'device'}
    <DevicePicker bind:deviceId={switchArg} />
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
        <button class="btn btn-ghost" on:click={() => addCase()}>Add case</button>
    </div>

    {#each cases as c, index}
        <div class="collapse collapse-arrow bg-base-300 my-1">
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

                <TextPicker label="Value" placeholder="Value" value={c.value} on:value={e => updateCaseValue(index, e.detail)} />

                {#if c.operator === 'equal' || c.operator === 'not-equal'}
                    <div role="alert" class="alert my-2">
                        <Icon data={mdiInformation} />
                        <span>If the propety value type is expected to be <code>boolean</code>, use numeric values 1/0 for true/false.</span>
                    </div>
                {:else if c.operator === 'starts-with' || c.operator === 'ends-with' || c.operator === 'contains'}
                    <div role="alert" class="alert my-2">
                        <Icon data={mdiInformation} />
                        <span>The <code>{c.operator}</code> operator only make sense if the property value type is <code>string</code>.</span>
                    </div>
                {:else if c.operator === 'less-than' || c.operator === 'greater-than'}
                    <div role="alert" class="alert my-2">
                        <Icon data={mdiInformation} />
                        <span>The <code>{c.operator}</code> operator only make sense if the property value type is <code>number</code>.</span>
                    </div>
                {/if}
            </div>
        </div>
    {/each}
{/if}