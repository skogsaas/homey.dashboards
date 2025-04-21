<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { mdiInformation } from "$lib/components/icons";
    import TextPicker from "$lib/components/TextPicker.svelte";
    import { createEventDispatcher } from "svelte";
    
    export let property: string | undefined;
    export let value: string | undefined;

    const dispatch = createEventDispatcher();

    $: dispatch('value', value);
</script>

{#if property === 'class'}
    <TextPicker label="Value" placeholder="Value" bind:value />

    <div role="alert" class="alert my-2">
        <Icon data={mdiInformation} />
        <span>A list of standard class IDs can be found in the <a class="link" href="https://apps-sdk-v3.developer.homey.app/tutorial-device-classes.html">Homey SDK reference</a>.</span>
    </div>
{:else if property === 'uiIndicator'}
    <TextPicker label="Value" placeholder="Value" {value} on:value={e => (value = e.detail)} />

    <div role="alert" class="alert my-2">
        <Icon data={mdiInformation} />
        <span>A list of standard capability IDs can be found in the <a class="link" href="https://apps-sdk-v3.developer.homey.app/tutorial-device-capabilities.html">Homey SDK reference</a>.</span>
    </div>
{:else if property === 'available'}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Available</span>
        </div>
        <select class="select w-full" {value} on:change={e => (value = e.currentTarget.value)} placeholder="Available">
            {#if value === undefined}
                <option value={undefined}></option>
            {/if}
            <option value="1">True</option>
            <option value="0">False</option>
        </select>
    </label>
{:else if property === 'ready'}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">Ready</span>
        </div>
        <select class="select w-full" {value} on:change={e => (value = e.currentTarget.value)} placeholder="Ready">
            {#if value === undefined}
                <option value={undefined}></option>
            {/if}
            <option value="1">True</option>
            <option value="0">False</option>
        </select>
    </label>
{/if}