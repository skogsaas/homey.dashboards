import BaseApi from "./BaseApi";

export default class TokenApi extends BaseApi {
    constructor(baseUrl: string, appToken: string) {
        super(baseUrl, appToken);
    }

    public async getAppToken() : Promise<string> {
        return super.get('/auth/token/app', { });
    }

    public async getHomeyToken() : Promise<string> {
        return super.get('/auth/token/homey', { });
    }
}