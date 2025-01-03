<script lang="ts">
    // Svelte
    import { goto } from '$app/navigation';

    // Stores
    import { favorite } from '$lib/stores/favorite';
    import { base } from '$app/paths';
    import { dashboardsLoading } from '$lib/stores/homey';

    $: run($favorite, $dashboardsLoading);

    async function run(_favorite: string, _loading: boolean) {
        if(_favorite === undefined) {
            await goto(base);
        } else if(_favorite !== undefined && !_loading) {
            await goto(base + "/board/?id=" + _favorite);
        }
    }
</script>