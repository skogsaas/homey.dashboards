import Homey from 'homey/lib/Homey';

interface Args { 
    homey: Homey;
    body: any;
    query: any;
    params: any;
}

async function getToken({ homey, params, query, body }: Args) {
    authorize(homey, query);

    return await homey.api.getOwnerApiToken();
}

function getDashboards({ homey, params, query, body }: Args) {
    authorize(homey, query);

    return homey.settings.get('dashboards');
}

function putDashboards({ homey, params, query, body }: Args) {
    authorize(homey, query);

    homey.settings.set('dashboards', body);
}

function authorize(homey: Homey, query: any) : void {
    // See app.ts for token description.

    const expectedToken = homey.settings.get('app_token');
    const actualToken = query['app_token'];

    if(expectedToken === undefined) {
        throw Error('Missing app token');
    }

    if(actualToken !== expectedToken) {
        throw Error('Invalid app token');
    }
}

module.exports = {
    getToken,
    getDashboards,
    putDashboards
};