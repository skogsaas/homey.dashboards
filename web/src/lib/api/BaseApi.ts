export default class BaseApi {
    private apiPath: string = '/api/app/skogsaas.dashboards';

    constructor(protected _baseUrl: string, protected _appToken: string) {}

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
        const url = this._baseUrl + this.apiPath + path + '?' + new URLSearchParams({ ...params, app_token: this._appToken }).toString();
        const response = await fetch(url, { method, body });

        console.log(response);

        if(!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.json();
    }
}