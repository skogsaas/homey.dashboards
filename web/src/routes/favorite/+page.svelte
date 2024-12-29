<script lang="ts">
    // Svelte
    import { goto } from '$app/navigation';

    // Stores
    import { favorite } from '$lib/stores/favorite';
    import { base } from '$app/paths';

    $: run();

    async function run() {
        const favorite = $favorite;

        if(favorite !== undefined && favorite !== null) {
            await goto(base + "/board/?id=" + favorite);
        } else {
            await goto(base + "/board/");
        }
    }
</script>