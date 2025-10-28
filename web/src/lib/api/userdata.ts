import { alerts } from "$lib/stores/alerting";
import type { Dashboard_v2 } from "$lib/types/Store";


export async function getDashboard(homeyUrl: string, dashboardId: string) : Promise<Dashboard_v2 | null> {
    try {
        const url = `${homeyUrl}/app/skogsaas.dashboards/userdata/${dashboardId}.json`;
        const request = { method: 'GET' };
        const response = await fetch(url, request);

        if(response.ok) {
            const data = await response.json();
            
            if(data) {
                return data.store as Dashboard_v2;
            }
        }
    } catch(e) {
        alerts.error("Exception while fetching dashboard", JSON.stringify(e), 10000);
    }

    return null;
}