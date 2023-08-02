import type { GridItem } from "$lib/types/Grid";
import BaseApi from "./BaseApi";

export default class DashboardApi extends BaseApi {
    constructor(baseUrl: string, appToken: string) {
        super(baseUrl, appToken);
    }

    public async getItems() : Promise<GridItem[]> {
        return super.get('/dashboards', {});
    }

    public async putItems(items: GridItem[]) : Promise<void> {
        return super.put('/dashboards', {}, items);
    }
}