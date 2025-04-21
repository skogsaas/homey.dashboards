<script lang="ts">
    // Svelte
    import { goto } from '$app/navigation';

    // Stores
    import { favorite } from '$lib/stores/favorite';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';

    onMount(async() =>  {
        if($favorite !== undefined) {
            await goto(base + "/board/?id=" + $favorite);
        } else {
            await goto(base);
        }
    });
</script>