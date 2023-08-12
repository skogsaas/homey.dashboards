<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    import { goto } from "$app/navigation";
    import { homey } from "$lib/stores/homey";

    let code: string | null;
    $: code = $page.url.searchParams.get('code');

    onMount(async () => {
        if(code != null) {
            const cloudApi = new AthomCloudAPI({
                clientId: '5a8d4ca6eb9f7a2c9d6ccf6d',
                clientSecret: 'e3ace394af9f615857ceaa61b053f966ddcfb12a'
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
            } else {
                goto('/');
            }
        }
    });
</script>