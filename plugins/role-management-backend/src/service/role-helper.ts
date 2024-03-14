import { RoleData, RoleManagementData } from "@internal/backstage-plugin-role-management-common";



export async function getRoles(dbClient: any): Promise<RoleManagementData[]> {
    const result = await dbClient('roles').select() as RoleData[];
    const data = result.map(x => {
      return {id:x.id, info: JSON.parse(x.info)}
    });

    return data as RoleManagementData[];
}

export async function insertRole(dbClient: any, item: RoleData) {
    await dbClient('roles').insert(item);
}

export async function updateRole(dbClient: any, data: RoleData) {
    await dbClient('roles')
        .update({ item: data.info })
        .where({ id: data.id });
}
