import { UserRole, UserRoleData } from "@internal/backstage-plugin-role-management-common";


export async function getUserRoles(dbClient: any, name: string): Promise<UserRole> {

    const whereValue = { name: name };

    const result = await dbClient('user-roles')
        .select()
        .where(whereValue)
        .limit(1) as UserRoleData[];

    if (result.length > 0) {

        return {
            id: result[0].id,
            name: result[0].name,
            roles: JSON.parse(result[0].roles)
        }

    } else {
        return {
            name: name,
            roles: [],
        }
    }
}


export async function createUserRoles(dbClient: any, data: UserRoleData): Promise<void> {
    await dbClient('user-roles').insert(data);
}