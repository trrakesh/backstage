import { EntityData, ImportEntityData, ImportEntityFilter } from "@internal/backstage-plugin-role-management-common";

export async function getImportEntityFilter(dbClient: any, filter: ImportEntityFilter) : Promise<ImportEntityData[]> {

    const whereValue = { kind: filter.kind === 'user' ? 'User' : 'Group' };

    const result = await dbClient('imported-entities')
        .select()
        .where(whereValue) as EntityData[];

    const data = result.map(x => {
        return { 
            id: x.id, 
            kind: x.kind, 
            entity: JSON.parse(x.entity), 
            groups: JSON.parse(x.groups),
            roles: JSON.parse(x.roles),
        }
    });

    return data as ImportEntityData[];

}

export async function getImportEntity(dbClient: any) : Promise<ImportEntityData[]> {

    const result = await dbClient('imported-entities')
        .select() as EntityData[];

    const data = result.map(x => {
        return { 
            id: x.id, 
            kind: x.kind, 
            entity: JSON.parse(x.entity), 
            groups: JSON.parse(x.groups),
            roles: JSON.parse(x.roles),
        }
    });

    return data as ImportEntityData[];

}

export async function insertImportEntity(dbClient: any, data: EntityData) {
    await dbClient('imported-entities').insert(data);
}


export async function updateImportEntity(dbClient: any, data: EntityData) {

    await dbClient('imported-entities')
      .update({ 
        entity: data.entity,
        groups: data.groups,
        roles: data.roles,
       })
      .where({ id: data.id });
}