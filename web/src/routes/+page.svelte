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

    $: dashboards = Object.values({ ...$homeyDashboards, ...$localDashboards });

    onMount(async () => {
        const apiKey = $page.url.searchParams.get('api-key');

        if(apiKey) {
            localKey = apiKey;
            active = '#local';
        }
    })

    function verifyApiKey() {
        apiKey.set(localKey);
        localKeyLoading = connectApiKey();
    }

    async function connectApiKey() {
        localKeyError = undefined;

        try {
            const instance: Homey = await HomeyAPI.createLocalAPI({
                address: $baseUrl,
                token: localKey,
            });

            return instance;
        }
        catch(e) {
            localKeyError = '' + e;
        }
    }

    async function setHomey(instance: Homey) {
        // TODO:
        //homeys.add(instance);
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
                    <Tabs.Tab key="#local" href="#local" on:click={() => (active = '#local')}>
                        Local
                    </Tabs.Tab>
                    <Tabs.Tab key="#online" href="#online" on:click={() => (active = '#online')}>
                        Online
                    </Tabs.Tab>
                 </Tabs>

                 <div class="pt-8">
                    {#if active === '#local'}
                        <p>Local authentication can only be used on the Homey Pro 2023 model. Older models do not have the API-Key feature.</p>
                        <p>Obtain an API-Key by navigating to <b>Homey -> Settings -> System -> API Keys</b>.</p>

                        <Input class="pt-8" name="local-key" bind:value={localKey} error={localKeyError} label="Homey API-Key">
                            <Input.Label slot="label">Homey API-key</Input.Label>
                        </Input>
                        {#if localKeyLoading === undefined}
                            <Button type="primary" disabled={localKey === ''} on:click={verifyApiKey}>Verify</Button>
                        {/if}
                        
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

<!--
<div class="align-center">
    {#if $homey !== undefined}
        <div>
            <h1>Welcome!</h1>
            {#if dashboards !== undefined && dashboards.length > 0}
            <Card>
                <Content>
                    <List>
                        {#each dashboards as dashboard}
                            <Item on:click={() => goto(base + '/board?id=' + dashboard.id)}>   
                                <Text>{dashboard.title}</Text>
                            </Item>
                        {/each}
                    </List>
                </Content>
            </Card>
            {:else}
                <h5>Oh no, you have no dashboards!<Icon class="material-icons">mood_bad</Icon></h5>
                <p>Add one by navigating Menu -> New</p>
                <p>
                    Or by adding a dashboard device on your homey.<br/>
                    <span style="color: orange;">NOTE:</span> Requires installed app.
                </p>
            {/if}
        </div>
    {:else}
        <div class="login">
            <TabBar tabs={['Local', 'Online']} let:tab bind:active>
                <Tab {tab}>
                    <Label>{tab}</Label>
                </Tab>
            </TabBar>
            
            {#if active === 'Local'}
                <Paper>
                    <Content>
                        <p>Local authentication can only be used on the Homey Pro 2023 model. Older models do not have the API-Key feature.</p>
                        <p>Obtain an API-Key by navigating to <b>Homey -> Settings -> System -> API Keys</b>.</p>
                        
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
                            use local login with API-key, only available for Homey Pro 2023.
                        </p>
                        
                        <Button on:click={oauthLogin}>Sign in</Button>
                    </Content>
                </Paper>
            {/if}
        </div>
    {/if}
</div>
-->