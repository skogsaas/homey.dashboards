<script lang="ts">
    import { devices, homey } from '$lib/stores/homey';

    import type { DeviceSettings_v1 } from './DeviceSettings';
    import type { DeviceObj } from '$lib/types/Homey';
    import { getIcon } from '$lib/components/icons/utils';

    import Icon from 'stwui/icon';

    export let settings: DeviceSettings_v1;
    export let mode: 'card'|'view';

    let device: DeviceObj;
    $: device = $devices[settings.deviceId ?? ''];
</script>

<div class="flex items-center">
    {#if device === undefined}
        {#if settings?.deviceId !== undefined}
            <span>Device not found</span>
        {:else}
            <span>Device not configured</span>
        {/if}
    {:else}
        {#if settings.iconId !== undefined}
            <Icon data={getIcon(settings.iconId)} class="m-1" size="32px" />
        {:else}
            {#await $homey.baseUrl}
                ...
            {:then url}
                <img class="w-8 h-8 m-1 dark:invert" src={url + device?.iconObj.url} alt={device?.icon} />
            {/await}
        {/if}

        <span class="w-full overflow-hidden overflow-ellipsis">{settings.title ?? device?.name}</span>
    {/if}
</div>