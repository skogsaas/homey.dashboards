export default class BaseApi {
    private apiPath: string = '/api/app/skogsaas.dashboards';

    constructor(protected baseUrl: string, protected appToken: string) {}

    protected async get(path: string, params: any) : Promise<any> {
        return this.call('GET', path, params, undefined);
    }

    protected async put(path: string, params: any, body: any) : Promise<any> {
        return this.call('PUT', path, params, body);
    }

    protected async post(path: string, params: any, body: any) : Promise<any> {
        return this.call('POST', path, params, body);
    }

    private async call(method: string, path: string, params: any, body: any) : Promise<any> {
        const url = this.baseUrl + this.apiPath + path + '?' + new URLSearchParams({ ...params, app_token: this.appToken }).toString();
        const response = await fetch(url, { method, body });

        if(!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.json();
    }
}