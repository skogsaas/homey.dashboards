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
    const storeId = params.storeId;
    const dashboardId = params.dashboardId;
    const settings = body;

    (homey.app as DashboardApp).setDashboardSettings(storeId, dashboardId, settings);
}

function deleteDashboards({ homey, params, body }: Args) {
    const storeId = params.storeId;
    const dashboardId = params.dashboardId;
    const settings = null; // Indicate that this dashboard should be deleted.

    (homey.app as DashboardApp).setDashboardSettings(storeId, dashboardId, settings);
}

function putTemplates({ homey, params, body }: Args) {
    const storeId = params.storeId;
    const templateId = params.templateId;
    const settings = body;

    (homey.app as DashboardApp).setTemplateSettings(storeId, templateId, settings);
}

function deleteTemplates({ homey, params, body }: Args) {
    const storeId = params.storeId;
    const templateId = params.templateId;
    const settings = null; // Indicate that this template should be deleted.

    (homey.app as DashboardApp).setTemplateSettings(storeId, templateId, settings);
}

function dashboardHeartbeat({ homey, params, body }: Args) {
    // TODO: 
}

module.exports = {
    getDashboards,
    putDashboards,
    deleteDashboards,
    putTemplates,
    deleteTemplates,
    dashboardHeartbeat
};