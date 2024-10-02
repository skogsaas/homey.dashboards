import Homey from 'homey/lib/Homey';
import { DashboardApp } from './app';

interface Args { 
    homey: Homey;
    body: any;
    query: any;
    params: any;
}

function getDashboards({ homey, query }: Args) {
    return homey.settings.get('dashboards');
}

function putDashboards({ homey, params, body }: Args) {
    (homey.app as DashboardApp).setDashboardSettings(params.storeId, params.dashboardId, body);
}

function putTemplates({ homey, params, body }: Args) {
    (homey.app as DashboardApp).setTemplateSettings(params.storeId, params.templateId, body);
}

function dashboardHeartbeat({ homey, params, body }: Args) {
    // TODO: 
}

module.exports = {
    getDashboards,
    putDashboards,
    putTemplates,
    dashboardHeartbeat
};