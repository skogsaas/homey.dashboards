import type { GridItem } from "$lib/types/Grid";
import BaseApi from "./BaseApi";

export default class TokenApi extends BaseApi {
    constructor(baseUrl: string, appToken: string) {
        super(baseUrl, appToken);
    }

    public async getToken() : Promise<GridItem[]> {
        return super.get('/token', {});
    }
}