import { webhookId, webhookUrl } from '$lib/constants';
import type { Dashboard_v2 } from '$lib/types/Dashboard';

export async function saveDashboard(homeyId: string, dashboard: Dashboard_v2) : Promise<boolean> {
    try {
        const url = webhookUrl + webhookId + '?homey=' + homeyId + '&operation=save_dashboard&dashboardId=' + dashboard.id;
        const request = { method: 'POST', body: JSON.stringify(dashboard) };
        const response = await fetch(url, request);

        if(response.ok) {
            return true;
        }
    } catch(e) {
    }

    return false;
}