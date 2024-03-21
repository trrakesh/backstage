import { Logger } from "winston";

import {
    GroupEntity,
    //stringifyEntityRef,
    UserEntity,
} from '@backstage/catalog-model';
import { DatabaseService } from '@backstage/backend-plugin-api';
import { UserAuth } from "@internal/backstage-plugin-role-management-common";

export async function readDBOrg(
    options: {
        logger: Logger,
        database: DatabaseService
    },
): Promise<{
    users: UserEntity[];
    groups: GroupEntity[];
}> {

    options.logger.info("readDBOrg");

    const users: UserEntity[] = [];
    const groups: GroupEntity[] = [];

    const dbClient = await options.database.getClient()

    const admin = defaultUserTransformer("admin", "Admin", "admin@exaple.coom");
    users.push(admin);

    try {
        const result = await dbClient('custom-users').select() as UserAuth[];

        result.forEach(x => {
            const user = defaultUserTransformer(x.username, x.display, x.email);
            users.push(user);
        });
    
    } catch {
        console.error(
            'Error while reading db'
        );
    }

    return {
        users,
        groups
    }
}

export function defaultUserTransformer(
    name: string, 
    displayName: string, 
    email: string): UserEntity {

    const entity: UserEntity = {
        apiVersion: 'backstage.io/v1beta1',
        kind: 'User',
        metadata: {
            name: '',
            annotations: {},
        },
        spec: {
            profile: {},
            memberOf: [],
        },
    };

    entity.metadata.name = name;
    entity.spec.profile!.displayName = displayName;
    entity.spec.profile!.email = email;

    return entity;

}

export function defaultGroupTransformer(
    name: string, 
    displayName: string, 
    email: string): GroupEntity {

    const entity: GroupEntity = {
        apiVersion: 'backstage.io/v1beta1',
        kind: 'Group',
        metadata: {
          name: '',
          annotations: {},
        },
        spec: {
          type: 'unknown',
          profile: {},
          children: [],
        },
    };

    entity.metadata.name = name;
    entity.spec.profile!.displayName = displayName;
    entity.spec.profile!.email = email;

    return entity;

}