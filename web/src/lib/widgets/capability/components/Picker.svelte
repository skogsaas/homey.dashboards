<script lang="ts">
    import { onMount } from 'svelte';

    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import List from 'stwui/list';
    import type { CapabilitySettings_v4 } from '../CapabilitySettings';

    export let settings: CapabilitySettings_v4;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'card'|'view';

    let value: string | undefined;
    $: disabled = !controllable || $editing;

    $: onValue(value);

    onMount(() => {
        value = capability.value;
    })

    async function onValue(v: string | undefined) {
        if(capability.setable &&  v !== capability?.value && v !== undefined) {
            if(!disabled) {
                await setCapabilityValue(v);
            }
        }
    }

    async function setCapabilityValue(value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId: capability.id,
            value
        });
    }
</script>

{#if capability !== undefined}
    {#if mode === 'card'}
        <span class="whitespace-nowrap">{capability.value ?? '...'} {capability.units ?? ''}</span>
    {:else}
        <div class="flex flex-col w-full">
            <List>
                {#each capability.values as option}
                    <List.Item class="cursor-pointer" on:click={() => value = option.id}>

                        <List.Item.Content slot="content">
                            <List.Item.Content.Title slot="title" class="mx-auto">
                                {#if option.id === value}
                                    <b>{option.title}</b>
                                {:else}
                                    {option.title}
                                {/if}
                            </List.Item.Content.Title>
                        </List.Item.Content>
                    </List.Item>
                {/each}
            </List>
        </div>
    {/if}
{/if}