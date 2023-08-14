<script lang="ts">
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import Button from '@smui/button';
    import Paper, { Content } from '@smui/paper';
    import Textfield from '@smui/textfield';
    import Icon from '@smui/textfield/icon';
    import CircularProgress from '@smui/circular-progress';

    import { baseUrl, homey } from '$lib/stores/homey';
    import type { Homey } from '$lib/types/Homey';
    import { apiKey } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    import { clientId, clientSecret } from '$lib/constants';

    import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
    import AthomCloudAPI, { Token } from 'homey-api/lib/AthomCloudAPI';
    
    let active = 'Local';

    let localKey: string = '';
    let localKeyInvalid: boolean = false;
    let localKeyLoading: Promise<Homey | undefined> | undefined;

    let inkUrl: string = '';
    let inkUrlInvalid: boolean = false;
    let inkUrlLoading: Promise<Homey | undefined> | undefined;

    function verifyApiKey() {
        apiKey.set(localKey);
        localKeyLoading = connectApiKey();
    }

    async function connectApiKey() {
        localKeyInvalid = false;

        try {
            const instance: Homey = await HomeyAPI.createLocalAPI({
                address: $baseUrl,
                token: localKey,
            });

            return instance;
        }
        catch(e) {
            localKeyInvalid = true;
        }
    }

    async function setHomey(instance: Homey) {
        homey.set(instance);

        await goto(base);
    }

    async function oauthLogin() {
        const cloudApi = new AthomCloudAPI({
            clientId,
            clientSecret,
            redirectUrl: 'http://localhost/oauth2/callback', // TODO: Replace
        });

        const loggedIn = await cloudApi.isLoggedIn();
        if (!loggedIn) {
            if (cloudApi.hasAuthorizationCode()) {
                await  cloudApi.authenticateWithAuthorizationCode();
            } else {
                window.location =  cloudApi.getLoginUrl();
                return;
            }
        }

        const user = await cloudApi.getAuthenticatedUser();
        const firstHomey = await user.getFirstHomey();
        const homeyApi = await firstHomey.authenticate();

        homey.set(homeyApi);

        await goto(base);
    }

    async function homeyInkLogin() : Promise<Homey | undefined> {
        inkUrlInvalid = false;

        const url = new URL(inkUrl);
        const token = url.searchParams.get('token');

        if(token === null) {
            inkUrlInvalid = true;
            return;
        }

        const jwt = JSON.parse(atob(token!));

        if(jwt?.refresh_token === undefined) {
            inkUrlInvalid = true;
            return;
        }

        // Login using the client id and secret for homey.ink
        const cloudApi = new AthomCloudAPI({
            clientId, 
            clientSecret,
            token: new Token(jwt)
        });

        await cloudApi.authenticateWithRefreshToken(jwt.refresh_token);

        const user = await cloudApi.getAuthenticatedUser();
        const firstHomey = await user.getFirstHomey();
        const homeyApi = await firstHomey.authenticate();

        return homeyApi;
    }
</script>

<div class="align-center">
    <div class="login">
        <TabBar tabs={['Local', 'Url', /*'Online'*/]} let:tab bind:active>
            <Tab {tab}>
                <Label>{tab}</Label>
            </Tab>
        </TabBar>
        
        {#if active === 'Url'}
            <Paper>
                <Content>
                    <p>Head over to <a href="https://homey.ink" target="_blank">Homey.ink</a> to log in.</p>
                    <p>After logging in, open the developer console by right clicking and selecting <b>inspect</b>, or just press F12.</p>
                    <p>Copy the url found in the console, and paste into the text field below.</p>
                    
                    <Textfield bind:value={inkUrl} invalid={inkUrlInvalid} label="Homey.ink URL">
                        <Icon class="material-icons" slot="leadingIcon">key</Icon>
                    </Textfield>

                    <Button disabled={inkUrl === ''} on:click={() => { inkUrlLoading = homeyInkLogin() }}>Verify</Button>
                    
                    {#await inkUrlLoading}
                        <p><CircularProgress style="height: 32px; width: 32px;" indeterminate /></p>
                    {:then instance}
                        {#if instance !== undefined}
                            {#await instance.system.getSystemName() then name}
                                <p>... connected to <b>{name}</b></p>
                            {/await}

                            {#await instance.sessions.getSessionMe() then session}
                                <p>... logged in as <b>{session.userName}</b></p>
                                <p>... with <b>{session.type} {session.clientName}</b></p>
                                <p>... scopes <b>{session.scopes}</b></p>

                                {#if !session.scopes.includes('homey.app') && !session.scopes.includes('homey')}
                                    <p>
                                        <span style="color: red;">Error:</span> Missing scope <b>homey.app</b>. 
                                        This is needed in order to contact the Dashboard app running on the Homey.
                                        Without this scope, dashboards will be loaded and stored locally in your browser.
                                    </p>
                                {:else}
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
                                {/if}
                            {/await}

                            <p>
                                <Button on:click={() => setHomey(instance)}>Continue</Button>
                            </p>
                        {/if}
                    {:catch error}
                        <p style="color: red;">{error}</p>
                    {/await}
                </Content>
            </Paper>
        {:else if active === 'Local'}
            <Paper>
                <Content>
                    <p>Local authentication can only be used on the Homey Pro 2023 model. Older models do not have the API-Key feature.</p>
                    <p>Obtain an API-Key by navigating to <b>Homey --> Settings --> System --> API Keys</b>.</p>
                    <p>
                        In order to get the full capabilities of the Dashboard app, please include the <b>homey.apps</b> scope. 
                        Other scopes can be included based on your planned usage of the dashboard.
                    </p>
                    
                    <Textfield bind:value={localKey} invalid={localKeyInvalid} label="Homey API-Key">
                        <Icon class="material-icons" slot="leadingIcon">key</Icon>
                    </Textfield>

                    <Button disabled={localKey === ''} on:click={verifyApiKey}>Verify</Button>
                    
                    {#await localKeyLoading}
                        <p><CircularProgress style="height: 32px; width: 32px;" indeterminate /></p>
                    {:then instance}
                        {#if instance !== undefined}
                            {#await instance.system.getSystemName() then name}
                                <p>... connected to <b>{name}</b></p>
                            {/await}

                            {#await instance.sessions.getSessionMe() then session}
                                <p>... logged in as <b>{session.userName}</b></p>
                                <p>... with <b>{session.type} {session.clientName}</b></p>
                                <p>... scopes <b>{session.scopes}</b></p>

                                {#if !session.scopes.includes('homey.app') && !session.scopes.includes('homey')}
                                    <p>
                                        <span style="color: red;">Error:</span> Missing scope <b>homey.app</b>. 
                                        This is needed in order to contact the Dashboard app running on the Homey.
                                        Without this scope, dashboards will be loaded and stored locally in your browser.
                                    </p>
                                {:else}
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
                                {/if}
                            {/await}

                            <p>
                                <Button on:click={() => setHomey(instance)}>Continue</Button>
                            </p>
                        {/if}
                    {:catch error}
                        <p style="color: red;">{error}</p>
                    {/await}
                </Content>
            </Paper>
        {:else if active === 'Online'}
            <Paper>
                <Content>
                    <p>Online authentication can be used with both the newer Homey Pro 2023 and older models.</p>
                    <p>
                        With online authentication, scopes cannot be selected individually. If you want to limit access, 
                        use the local login with API-key if the feature is available on your Homey.
                    </p>
                    
                    <Button on:click={oauthLogin}>Sign in</Button>
                </Content>
            </Paper>
        {/if}
    </div>
</div>

<style>
    .align-center {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .login {
        margin-top: 20px;
        max-width: 500px;
    }
</style>