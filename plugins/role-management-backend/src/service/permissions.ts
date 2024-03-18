import { RoleData, RoleManagementData } from "@internal/backstage-plugin-role-management-common";
//import data from "../data/data.json";

export async function getUserPermissions(dbClient: any, name: string): Promise<RoleManagementData> {

    // const whereValue = { name: name };

    // const result = await dbClient('user-roles')
    //     .select()
    //     .where(whereValue)
    //     .limit(1) as UserRoleData[];

    // if (result.length > 0) {

      
    // }

    console.log(name);

    const result = await dbClient('roles').select() as RoleData[];
    const data = result.map(x => {
        return {id:x.id, info: JSON.parse(x.info)}
    });

    if (data.length > 0) {
        return data[0] as RoleManagementData;
    }

    return {info: {roleName: "", data: [] }}
}