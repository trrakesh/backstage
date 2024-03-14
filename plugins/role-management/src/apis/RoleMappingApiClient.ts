import { ResponseError } from '@backstage/errors';
import { createApiRef } from '@backstage/core-plugin-api';
import { 
    ImportEntityData,
    ImportEntityFilter,
    ImportEntityMappingApiStatus,
    RoleManagementData, 
    RoleMappingApi, 
    RoleMappingApiStatus,
    RolePermissonData, 
} from "@internal/backstage-plugin-role-management-common"
import { ApiBase } from './ApiBase';

export const roleMappingApiRef = createApiRef<RoleMappingApi>({
    id: 'plugin.roles.mapping.api',
});


export class RoleMappingApiClient extends ApiBase implements RoleMappingApi {

    async getRoles(): Promise<RoleManagementData[]> {

        const info = await this.getUrlAndToken("roles");
        const query = new URLSearchParams();

        const res = await fetch(`${info.baseUrl}?${query}`, this.getGetHeader(info.token));
        if (!res.ok) {
            throw await ResponseError.fromResponse(res);
        }

        return await res.json() as RoleManagementData[];
    }

    async createRole(data: RoleManagementData): Promise<RoleMappingApiStatus> {

        const info = await this.getUrlAndToken("roles");

        const res = await fetch(info.baseUrl, this.getPostHeader(info.token, data));

        if (!res.ok) {
            throw await ResponseError.fromResponse(res);
        }

        return await res.json() as RoleMappingApiStatus;
    }

    async updateRole(data: RoleManagementData): Promise<RoleMappingApiStatus> {

        const info = await this.getUrlAndToken("roles");

        const res = await fetch(info.baseUrl, this.getPutHeader(info.token, data));

        if (!res.ok) {
            throw await ResponseError.fromResponse(res);
        }

        return await res.json() as RoleMappingApiStatus;
    }

    async getImportEntity(filter: ImportEntityFilter): Promise<ImportEntityData[]> {
        
        const info = await this.getUrlAndToken("roles");

        const query = new URLSearchParams();
        query.append("kind", filter.kind);

        const res = await fetch(`${info.baseUrl}/import-entity?${query}`, this.getGetHeader(info.token));

        if (!res.ok) {
            throw await ResponseError.fromResponse(res);
        }

        return await res.json() as ImportEntityData[];
    }


    async createImportEntity(data: ImportEntityData): Promise<ImportEntityMappingApiStatus> {

        const info = await this.getUrlAndToken("roles");

        const res = await fetch(`${info.baseUrl}/import-entity`, this.getPostHeader(info.token, data));

        if (!res.ok) {
            throw await ResponseError.fromResponse(res);
        }

        return await res.json() as ImportEntityMappingApiStatus;

    }

    async updateImportEntity(data: ImportEntityData): Promise<ImportEntityMappingApiStatus> {

        const info = await this.getUrlAndToken("roles");

        const res = await fetch(`${info.baseUrl}/import-entity`, this.getPutHeader(info.token, data));

        if (!res.ok) {
            throw await ResponseError.fromResponse(res);
        }

        return await res.json() as ImportEntityMappingApiStatus;
    }

    async getPermissionByMail(mail: string): Promise<RolePermissonData[]> {
        
        const info = await this.getUrlAndToken("roles");

        
        const query = new URLSearchParams();
        query.append("mail", mail);

        const res = await fetch(`${info.baseUrl}/import-entity/profile?${query}`, this.getGetHeader(info.token));

        if (!res.ok) {
            throw await ResponseError.fromResponse(res);
        }

        return await res.json() as RolePermissonData[];

    }

}
