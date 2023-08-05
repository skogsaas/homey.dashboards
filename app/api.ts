import Homey from 'homey/lib/Homey';
import jwt from 'jsonwebtoken';
import { DashboardApp } from './app';

interface Args { 
    homey: Homey;
    body: any;
    query: any;
    params: any;
}

type Scope = 'app_token' | 'homey_token' | 'dashboards';

interface Token extends jwt.JwtPayload {
    scp?: Scope;
}

function getAuthCode({ homey }: Args) {
    // Create a token that only has the scope for retrieving an app token, and make 
    // it expire in 2 minutes.
    const scp: Scope[] = ['app_token'];
    const payload = { scp };
    return sign(homey, payload, '2m');
}

function getAppToken({ homey, query }: Args) {
    const token = query.app_token;

    if(token === undefined) {
        throw Error('Missing token');
    }

    // Verify that the token has the required scope
    verifyScope(homey, token, 'app_token');
    
    // Create new token with all scopes
    const scp: Scope[] = ['app_token', 'homey_token', 'dashboards'];
    return sign(homey, { scp }, '11m');
}

async function getHomeyToken({ homey, query }: Args) {
    verifyScope(homey, query.app_token, 'homey_token');

    return await homey.api.getOwnerApiToken();
}

function getDashboards({ homey, query }: Args) {
    verifyScope(homey, query.app_token, 'dashboards');

    return homey.settings.get('dashboards');
}

function putDashboards({ homey, query, body }: Args) {
    verifyScope(homey, query.app_token, 'dashboards');

    homey.settings.set('dashboards', body);
}

function sign(homey: Homey, payload: object, expiresIn: string) {
    const privateKey = (homey.app as DashboardApp).privateKey;

    return jwt.sign(
        payload, 
        privateKey!, { 
            algorithm: 'RS256', 
            expiresIn,
            issuer: 'skogsaas.homey'
        });
}

function verify(homey: Homey, token: string) {
    const publicKey = (homey.app as DashboardApp).publicKey;

    return jwt.verify(
        token, 
        publicKey!, { 
            issuer: 'skogsaas.homey'
        });
}

function verifyScope(homey: Homey, token: string, scope: Scope) : void {
    if(token === undefined) {
        throw Error('Missing token');
    }

    // Verify the token
    const payload = verify(homey, token) as Token;
    
    // Ensure the app_token scope is included
    if(payload.scp !== undefined && !payload.scp.includes(scope)) {
        throw Error('Missing scope \'' + scope + '\'');
    }
}

module.exports = {
    getAuthCode,
    getAppToken,
    getHomeyToken,
    getDashboards,
    putDashboards
};