<script lang="ts">
    import { baseUrl, dashboards as homeyDashboards, homey, homeys } from '$lib/stores/homey';
    import { dashboards as localDashboards } from '$lib/stores/localstorage';
    import type { Homey } from '$lib/types/Homey';
    import { apiKey } from '$lib/stores/auth';
    
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    import { clientId, clientSecret } from '$lib/constants';

    import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
    import AthomCloudAPI from 'homey-api/lib/AthomCloudAPI';

    // Tailwind
    import Card from "stwui/card";
    import List from "stwui/list";
    import Button from 'stwui/button';
    import Input from 'stwui/input';
    import Icon from 'stwui/icon';
    import Progress from 'stwui/progress';
    import Tabs from 'stwui/tabs';
    import { mdiEmoticonSadOutline } from '$lib/components/icons';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    let active = import.meta.env.VITE_DEFAULT_LOGIN ?? '#online';

    let localKey: string = '';
    let localKeyError: string | undefined;
    let localKeyLoading: Promise<Homey | undefined> | undefined;
    let localHosting: boolean = false;
    let localHomeyId: string = '';

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards });

    onMount(async () => {
        const apiKey = $page.url.searchParams.get('api-key');

        if($page.url.origin.includes('.homey.homeylocal.com') || $page.url.origin.includes('.connect.athom.com') || import.meta.env.VITE_HOMEY_URL){
            localHosting = true;
        }

        if(apiKey) {
            localKey = apiKey;
            active = '#direct';
        }
    })

    function verifyApiKey() {
        localKeyLoading = connectApiKey();
    }

    async function connectApiKey() {
        localKeyError = undefined;

        try {
            const url = localHosting ? $baseUrl : 'https://' + localHomeyId + '.connect.athom.com';

            const instance: Homey = await HomeyAPI.createLocalAPI({
                address: url,
                token: localKey,
            });

            return instance;
        }
        catch(e) {
            localKeyError = '' + e;
        }
    }

    async function setHomey(instance: Homey) {
        if(!localHosting) {
            localStorage.homeyId = localHomeyId;
        }

        apiKey.set(localKey);
        homey.set(instance);

        await goto(base + '/');
    }

    async function oauthLogin() {
        const cloudApi = new AthomCloudAPI({
            clientId,
            clientSecret,
            redirectUrl: import.meta.env.VITE_OAUTH_REDIRECT
        });

        const loggedIn = await cloudApi.isLoggedIn();
        if (!loggedIn) {
            if (cloudApi.hasAuthorizationCode()) {
                await cloudApi.authenticateWithAuthorizationCode();
            } else {
                window.location =  cloudApi.getLoginUrl();
                return;
            }
        }

        const user = await cloudApi.getAuthenticatedUser();
        const firstHomey = await user.getFirstHomey();
        const homeyApi = await firstHomey.authenticate();

        homey.set(homeyApi);

        await goto(base + '/');
    }
</script>

<div class="flex flex-col justify-center mx-auto max-w-md">
    {#if $homey !== undefined}
        <h1 class="inline text-center pt-8 pb-8">Welcome!</h1>

        {#if dashboards !== undefined && dashboards.length > 0}
            <Card>
                <Card.Content>
                    <List>
                        {#each dashboards as dashboard}
                            <List.Item on:click={() => goto(base + '/board?id=' + dashboard.id)} class="cursor-pointer">   
                                {dashboard.title}
                            </List.Item>
                        {/each}
                    </List>
                </Card.Content>
            </Card>
        {:else}
            <h5>Oh no, you have no dashboards! <Icon data={mdiEmoticonSadOutline} /></h5>
            <p>Add one by navigating Menu -> New</p>
            <p>
                Or by adding a dashboard device on your homey.<br/>
                <span style="color: orange;">NOTE:</span> Requires installed app.
            </p>
        {/if}
    {:else}
        <h1 class="inline text-center pt-8 pb-8">Login</h1>
        
        <Card>
            <Card.Content>
                <Tabs currentTab={active} variant="full-width">
                    <Tabs.Tab key="#direct" href="#direct" on:click={() => (active = '#direct')}>
                        Direct
                    </Tabs.Tab>
                    <Tabs.Tab key="#online" href="#online" on:click={() => (active = '#online')}>
                        Online
                    </Tabs.Tab>
                 </Tabs>

                 <div class="pt-8">
                    {#if active === '#direct'}
                        <p>Direct authentication can only be used on the Homey Pro 2023 model. Older models do not have the API-Key feature.</p>

                        {#if !localHosting}
                            <p class="pt-8">Obtain the Homey-ID by navigating to <b>Homey -> Settings -> General</b> and scroll down to the Cloud section.</p>
                            <Input name="local-homey-id" bind:value={localHomeyId} error={localHomeyId.length > 0 && localHomeyId.length !== 24 ? 'Must be 24 characters' : ''} label="Homey ID">
                                <Input.Label slot="label">Homey ID</Input.Label>
                            </Input>
                        {/if}

                        <p class="pt-8">Obtain an API-Key by navigating to <b>my.homey.app -> Settings -> API Keys</b>.</p>
                        <Input name="local-key" bind:value={localKey} error={localKeyError} label="Homey API-Key">
                            <Input.Label slot="label">Homey API-key</Input.Label>
                        </Input>

                        <Button type="primary" disabled={localKey === '' || (!localHosting && localHomeyId.length != 24)} on:click={verifyApiKey}>Verify</Button>
                        
                        {#await localKeyLoading}
                            <Progress size="xs" indeterminate value={0} />
                        {:then instance}
                            {#if instance !== undefined}
                                {#await instance.system.getSystemName() then name}
                                    <p>... connected to <b>{name}</b></p>
                                {/await}

                                {#await instance.sessions.getSessionMe() then session}
                                    <p>... logged in as <b>{session.userName}</b></p>
                                    <p>... with <b>{session.type} {session.clientName}</b></p>
                                    <p>... scopes <b>{session.scopes}</b></p>

                                    {#if session.scopes.includes('homey.app') || session.scopes.includes('homey')}
                                        {#await instance.apps.getApp({ id: 'skogsaas.dashboards' })}
                                            ... looking for the Dashboard app
                                        {:then app}
                                            ... the Dashboard app is installed
                                        {:catch}
                                            <p>
                                                <span style="color: red;">Error:</span> The dashboard app is not installed. 
                                                Without this app, dashboards will be loaded and stored locally in your browser.
                                            </p>
                                        {/await}
                                    {:else}
                                        <p>
                                            <span style="color: orange;">Warning:</span> Missing scopes to resolve installed
                                            apps. If the Dashboard app is not installed, all dashboards will be loaded and stored
                                            locally in your browser.
                                        </p>
                                    {/if}
                                {/await}

                                <p>
                                    <Button type="primary" on:click={() => setHomey(instance)}>Continue</Button>
                                </p>
                            {/if}
                        {:catch error}
                            <p style="color: red;">{error}</p>
                        {/await}
                    {:else if active === '#online'}
                        <p>Online authentication can be used with both the newer Homey Pro 2023 and older models.</p>
                        <p>
                            With online authentication, scopes cannot be selected individually. If you want to limit access, 
                            use local login with API-key, only available for Homey Pro 2023.
                        </p>
                        
                        <Button type="primary" on:click={oauthLogin}>Sign in</Button>
                    {/if}
                </div>
            </Card.Content>
        </Card>
    {/if}
</div>