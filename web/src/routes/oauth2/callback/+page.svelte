<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
    import { homey } from "$lib/stores/homey";
    import { clientId, clientSecret } from "$lib/constants";
    import { alerts } from "$lib/stores/alerting";

    let code: string | null;
    $: code = $page.url.searchParams.get('code');

    onMount(async () => {
        if(code != null) {
            const cloudApi = new AthomCloudAPI({
                clientId,
                clientSecret // It's bullshit that the client secret must be provided for a public client. This basically makes the secret publicly known.
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
                    alerts.error('Error!', 'No authorization code found.', 10000);
                }
            }
        }

        await goto(base + '/');
    });
</script>