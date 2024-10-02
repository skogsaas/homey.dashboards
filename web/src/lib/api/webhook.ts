import { webhookId, webhookUrl } from '$lib/constants';
import type { Dashboard_v2, Template_v1 } from '$lib/types/Store';

export async function saveDashboard(homeyId: string, storeId: string, dashboard: Dashboard_v2) : Promise<boolean> {
    try {
        const url = webhookUrl + webhookId + '?homey=' + homeyId + '&operation=save_dashboard&storeId=' + storeId + '&dashboardId=' + dashboard.id;
        const request = { method: 'POST', body: JSON.stringify(dashboard) };
        const response = await fetch(url, request);

        if(response.ok) {
            return true;
        }
    } catch(e) {
    }

    return false;
}

export async function saveTemplate(homeyId: string, storeId: string, template: Template_v1) : Promise<boolean> {
    try {
        const url = webhookUrl + webhookId + '?homey=' + homeyId + '&operation=save_template&storeId=' + storeId + '&templateId=' + template.id;
        const request = { method: 'POST', body: JSON.stringify(template) };
        const response = await fetch(url, request);

        if(response.ok) {
            return true;
        }
    } catch(e) {
    }

    return false;
}