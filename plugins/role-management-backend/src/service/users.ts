import { UserAuth, ValidateUserAuth } from "@internal/backstage-plugin-role-management-common";


export async function createUser(dbClient: any, data: UserAuth): Promise<void>  {

    console.log("-----------------------------------------------");
    console.log("-----------------------------------------------");
    console.log("-------------createUser----------------------------------");
    console.log("-----------------------------------------------");
    console.log("-----------------------------------------------");
    console.log("-----------------------------------------------");

    await dbClient('custom-users').insert(data);
}


export async function validateUser(dbClient: any, data: ValidateUserAuth): Promise<boolean>  {

    const whereValue = { username: data.username, password: data.password };

    const found = await dbClient('custom-users')
        .select()
        .where(whereValue)
        .limit(1) as UserAuth[];

    return found.length == 1;
}

export async function existUser(dbClient: any, username: string): Promise<boolean>  {

    const whereValue = { username };

    const found = await dbClient('custom-users')
        .select()
        .where(whereValue)
        .limit(1) as UserAuth[];

    return found.length == 1;
}

