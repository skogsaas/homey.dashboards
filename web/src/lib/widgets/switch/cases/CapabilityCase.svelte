<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { mdiInformation } from "$lib/components/icons";
    import TextPicker from "$lib/components/TextPicker.svelte";
    import { createEventDispatcher } from "svelte";
    
    export let property: string | undefined;
    export let operator: string | undefined;
    export let value: string | undefined;

    const dispatch = createEventDispatcher();

    $: dispatch('value', value);
</script>

{#if property === 'id'}
    <TextPicker label="Value" placeholder="Value" bind:value />

    <div role="alert" class="alert my-2">
        <Icon data={mdiInformation} />
        <span>A list of standard capability IDs can be found in the <a class="link" href="https://apps-sdk-v3.developer.homey.app/tutorial-device-capabilities.html">Homey SDK reference</a>.</span>
    </div>
{:else if property === 'type'}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Type</span>
        </div>
        <select class="select w-full" {value} on:change={e => (value = e.currentTarget.value)} placeholder="Type">
            {#if value === undefined}
                <option value={undefined}></option>
            {/if}
            <option value="boolean">boolean</option>
            <option value="number">number</option>
            <option value="string">string</option>
            <option value="enum">enum</option>
        </select>
    </label>
{:else if property === 'gettable'}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Gettable</span>
        </div>
        <select class="select w-full" {value} on:change={e => (value = e.currentTarget.value)} placeholder="Gettable">
            {#if value === undefined}
                <option value={undefined}></option>
            {/if}
            <option value="1">True</option>
            <option value="0">False</option>
        </select>
    </label>
{:else if property === 'settable'}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Settable</span>
        </div>
        <select class="select w-full" {value} on:change={e => (value = e.currentTarget.value)} placeholder="Settable">
            {#if value === undefined}
                <option value={undefined}></option>
            {/if}
            <option value="1">True</option>
            <option value="0">False</option>
        </select>
    </label>
{:else if property === 'value'}
    <TextPicker label="Value" placeholder="Value" {value} on:value={e => (value = e.detail)} />

    {#if operator === 'equal' || operator === 'not-equal'}
        <div role="alert" class="alert my-2">
            <Icon data={mdiInformation} />
            <span>If the value type is expected to be <code>boolean</code>, use numeric values 1/0 for true/false.</span>
        </div>
    {/if}
{/if}