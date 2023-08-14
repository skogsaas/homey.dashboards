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

                    // The AthomCloudAPI takes care of storing token to local storage itself
                    //oauth.set(token);

                    // Get the logged in user
                    const user = await cloudApi.getAuthenticatedUser();

                    // Get the first Homey of the logged in user
                    const firstHomey = await user.getFirstHomey();

                    // Create a session on this Homey
                    const homeyApi = await firstHomey.authenticate();

                    homey.set(homeyApi);
                } else {
                    // TODO: Display some error
                }
            }
        }

        await goto(base);
    });
</script>