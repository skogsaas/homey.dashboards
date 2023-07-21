import Homey from 'homey/lib/Homey';

interface Args { 
    homey: Homey;
    body: any;
    query: any;
    params: any;
}

function getDashboards({ homey, query }: Args) {
    authorize(homey, query);

    return homey.settings.get('dashboards');
}

function putDashboards({ homey, query, body }: Args) {
    authorize(homey, query);

    homey.settings.set('dashboards', body);
}

function authorize(homey: Homey, query: any) : void {
    // See app.ts for token description.

    const token = homey.settings.get('app_token');

    if(query['token'] !== token) {
        throw Error('Invalid token');
    }
}

module.exports = {
    getDashboards,
    putDashboards
};