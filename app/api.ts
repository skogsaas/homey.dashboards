import Homey from 'homey/lib/Homey';

interface Args { 
    homey: Homey;
    body: any;
    query: any;
    params: any;
}

function getDashboards({ homey, query }: Args) {
    //verifyScope(homey, query.app_token, 'dashboards');

    return homey.settings.get('dashboards');
}

function putDashboards({ homey, query, body }: Args) {
    //verifyScope(homey, query.app_token, 'dashboards');

    homey.settings.set('dashboards', body);
}


module.exports = {
    getDashboards,
    putDashboards
};