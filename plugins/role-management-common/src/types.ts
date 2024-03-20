import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';

/***/
/**
 * Common functionalities for the role-management plugin.
 *
 * @packageDocumentation
 */

export type RoleData = {
  id?: number;
  info: string;
}

export type EntityData = {
  id?: number;
  entity: string;
  kind: string;
  groups: string;
  roles: string;
}

export type ConfigData = {
  key: string;
  name: string;
}

export type RolePermisson = {
  info: ConfigData;
  checked: boolean;
}

export type RolePermissonData = {
  category: ConfigData;
  permissions: RolePermisson[];
}

export type RoleInfomation = {
  id?: number;
  roleName: string;
  data: RolePermissonData[];
};

export type RoleManagementData = {
  id?: number;
  info: RoleInfomation;
};

export type RoleMappingApiStatus = {
  status: string;
};

export type ImportEntityData = {
  id?: number;
  entity: Entity;
  kind: string;
  roles: string[];
  groups: string[];
};

export type ImportEntityFilter = {
  kind: string
}

export type ImportEntityMappingApiStatus = {
  status: string;
};

export type RoleSelectItem = {
  label: string; value: string
};

export type UserRoleData = {
  id?: number,
  name: string,
  roles: string
}

export type UserRole = {
  id?: number,
  name: string,
  roles: string[]
}

export type UserAuth = {
  username: string; 
  password: string,
  display: string,
  email: string
};

export type ValidateUserAuth = {
  username: string; 
  password: string,
};

export interface RoleMappingApi {

  getRoles(): Promise<RoleManagementData[]>;
  createRole(data: RoleManagementData): Promise<RoleMappingApiStatus>;
  updateRole(data: RoleManagementData): Promise<RoleMappingApiStatus>;

  getUserRole(name: string): Promise<UserRole>;
  createUserRole(data: UserRole): Promise<RoleMappingApiStatus>;

  getUserPermission(name: string): Promise<RoleManagementData>;

  createUser(user: UserAuth): Promise<RoleMappingApiStatus>;
  validateUser(validate: ValidateUserAuth): Promise<RoleMappingApiStatus>;
  existUser(username: string): Promise<RoleMappingApiStatus>;

  // getImportEntity(filter: ImportEntityFilter): Promise<ImportEntityData[]>;
  // createImportEntity(data: ImportEntityData): Promise<ImportEntityMappingApiStatus>;
  // updateImportEntity(data: ImportEntityData): Promise<ImportEntityMappingApiStatus>;

  // getPermissionByMail(mail: string): Promise<RolePermissonData[]>;

}

export interface ApiOptions {
  baseUrl: string;
  token: string | undefined;
}

export interface ApiClientOptions {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
}