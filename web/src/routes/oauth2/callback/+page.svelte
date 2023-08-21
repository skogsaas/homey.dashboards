<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
    import { homey } from "$lib/stores/homey";
    import { clientId, clientSecret } from "$lib/constants";

    let code: string | null;
    $: code = $page.url.searchParams.get('code');

    onMount(async () => {
        if(code != null) {
            const cloudApi = new AthomCloudAPI({
                clientId,
                clientSecret
            });

            const loggedIn = await cloudApi.isLoggedIn();
            if (!loggedIn) {
                if (cloudApi.hasAuthorizationCode()) {
                    const token = await  cloudApi.authenticateWithAuthorizationCode();
                    const user = await cloudApi.getAuthenticatedUser();
                    const firstHomey = await user.getFirstHomey();
                    const homeyApi = await firstHomey.authenticate();

                    homey.set(homeyApi);
                } else {
                    // TODO: Display some error
                }
            }
        }

        await goto(base + '/');
    });
</script>