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
    import Icon from 'stwui/icon';
    import { mdiAccount, mdiEmoticonSadOutline, mdiKey, mdiLock, mdiViewDashboard } from '$lib/components/icons';
    import { getIcon } from '$lib/components/icons/utils';
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

        if($page.url.origin.includes('.homey.homeylocal.com') || 
            $page.url.origin.includes('.connect.athom.com') || 
            $page.url.hostname.includes('.local') || 
            import.meta.env.VITE_HOMEY_URL
        ){
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

<div class="flex flex-col justify-center mx-auto w-full">
    {#if $homey !== undefined}
        <div class="hero min-h-screen bg-base-200">
            <div class="hero-content flex-col lg:flex-row-reverse">
                <div class="text-center lg:text-left">
                    <h1 class="text-5xl font-bold">Dashboards</h1>
                    <p class="py-6">
                        Add a new dashboard by using the native Homey app to add a new device of type <code>Dashboard</code>.<br/>
                        <span class="text-warning">NOTE:</span> This requires you to install the Dashboards companion app.
                    </p>
                </div>
                <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    {#if dashboards !== undefined && dashboards.length > 0}
                        <div class="card w-96 bg-base-100 shadow-xl">
                            <div class="card-body">                                
                                {#each dashboards as dashboard, i}
                                    <button class="btn btn-ghost w-full" on:click={() => goto(base + '/board/?id=' + dashboard.id)}>
                                        <Icon data={getIcon(dashboard.iconId ?? 'view-dashboard')} />
                                        {dashboard.title}
                                        <span class="mx-auto"></span>
                                    </button>

                                    {#if i < (dashboards.length - 1)}
                                        <div class="divider divider-neutral my-1"></div>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {:else}
                        <h5>Oh no, you have no dashboards! <Icon data={mdiEmoticonSadOutline} /></h5>
                    {/if}
                </div>
            </div>
        </div>
    {:else}
        <div class="hero min-h-screen bg-base-200">
            {#if active === '#direct'}
                <div class="hero-content flex-col lg:flex-row-reverse">
                    <div class="text-center lg:text-left">
                        <h1 class="text-5xl font-bold">Welcome!</h1>
                        <p class="py-6">
                            Direct authentication can only be used on the Homey Pro 2023 model. Older models do not have the API-Key feature.
                        </p>
                        <button class="btn btn-ghost" on:click={() => active = '#online'}>
                            <Icon data={mdiAccount} />
                            Login using Athom credentials instead
                        </button>
                    </div>
                    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                        <form class="card-body">    
                            {#if !localHosting}
                                <p class="pt-6">
                                    You can obtain the Homey-ID by navigating to:
                                </p>
                                <div class="text-sm breadcrumbs">
                                    <ul>
                                        <li>Homey</li> 
                                        <li>Settings</li> 
                                        <li>General</li>
                                        <li>Cloud</li>
                                    </ul>
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text">Homey ID</span>
                                    </label>
                                    <input type="text" class="input input-primary" bind:value={localHomeyId} />
                                    {#if localHomeyId.length > 0 && localHomeyId.length !== 24}
                                        <label class="label">
                                            <span class="label-text-alt">Must be 24 characters</span>
                                        </label>
                                    {/if}
                                </div>

                                <div class="divider"></div>
                            {/if}
    
                            {#if localHosting || localHomeyId.length === 24}
                                <p class="pt-6">
                                    You can then create a API-key at:
                                </p>
                                <div class="text-sm breadcrumbs">
                                    <ul>
                                        <li><a href="https://my.homey.app" target="_blank">my.homey.app</a></li> 
                                        <li>Settings</li> 
                                        <li>API Keys</li>
                                    </ul>
                                </div>
        
                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text">Homey API-Key</span>
                                    </label>
                                    <input type="text" class="input input-primary" bind:value={localKey} />
                                    {#if localKeyError !== undefined}
                                        <label class="label">
                                            <span class="label-text-alt">{localKeyError}</span>
                                        </label>
                                    {/if}
                                </div>
                            {/if}
                                
                            <button 
                                class="btn btn-primary mt-6" 
                                disabled={localKey === '' || (!localHosting && localHomeyId.length != 24)} 
                                on:click={verifyApiKey}
                            >
                                Verify
                            </button>
                            
                            {#await localKeyLoading}
                                <span class="loading loading-infinity loading-lg"></span>
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
                                        <button class="btn btn-primary" on:click={() => setHomey(instance)}>Continue</button>
                                    </p>
                                {/if}
                            {:catch error}
                                <p style="color: red;">{error}</p>
                            {/await}
                        </form>
                    </div>
                </div>
            {:else}
                <div class="hero-content flex-col lg:flex-row">
                    <div class="text-center lg:text-left">
                        <h1 class="text-5xl font-bold">Welcome!</h1>
                        <p class="py-6">
                            Online authentication can be used with both
                            <br/>
                            the newer Homey Pro 2023 and older models.
                        </p>

                        <button class="btn btn-ghost" on:click={() => active = '#direct'}>
                            <Icon data={mdiKey} />
                            Login using an API-key instead
                        </button>
                    </div>
                    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100 p-4">
                        <p class="pb-6">
                            With online authentication, scopes cannot be selected individually. If you want to limit access, 
                            use local login with API-key, only available for Homey Pro 2023.
                        </p>
                        
                        <button class="btn btn-primary" on:click={oauthLogin}>Head over to Athom to sign in</button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>