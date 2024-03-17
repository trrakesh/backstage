
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { ApiClientOptions, ApiOptions } from '@internal/backstage-plugin-role-management-common';

export class ApiBase {

    private readonly discoveryApi: DiscoveryApi;
    private readonly identityApi: IdentityApi;

    constructor(options: ApiClientOptions) {
        this.discoveryApi = options.discoveryApi;
        this.identityApi = options.identityApi;
    }

    async getUrlAndToken(type: string) : Promise<ApiOptions> {

        const baseUrl = await this.discoveryApi.getBaseUrl(type);
        const { token } = await this.identityApi.getCredentials();

        return {baseUrl, token};
    }

    getGetHeader(token: string | undefined): any {
        return {
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : undefined,
        }
    }

    getPostHeader(token: string | undefined, body: any):any {
        return {
            method: 'POST',
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
                : {
                    'Content-Type': 'application/json',
                },
            body: JSON.stringify(body),
        }
    }

    getPutHeader(token: string | undefined, body: any):any {
        return {
            method: 'PUT',
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
                : {
                    'Content-Type': 'application/json',
                },
            body: JSON.stringify(body),
        }
    }
}