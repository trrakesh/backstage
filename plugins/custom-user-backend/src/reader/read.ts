import { Logger } from "winston";

import {
    GroupEntity,
    //stringifyEntityRef,
    UserEntity,
} from '@backstage/catalog-model';

export async function readDBOrg(
    options: {
        logger: Logger;
    },
): Promise<{
    users: UserEntity[];
    groups: GroupEntity[];
}> {


    options.logger.info("readDBOrg");

    const users: UserEntity[] = [];
    const groups: GroupEntity[] = [];

    const user1 = await defaultUserTransformer("user1", "User 1", "user1@exaple.coom");
    const user2 = await defaultUserTransformer("user2", "User 2", "user2@exaple.coom");
    const user3 = await defaultUserTransformer("user3", "User 3", "user3@exaple.coom");
    const user4 = await defaultUserTransformer("user4", "User 4", "user4@exaple.coom");
    const user5 = await defaultUserTransformer("user5", "User 5", "user5@exaple.coom");

    users.push(user1);
    users.push(user2);
    users.push(user3);
    users.push(user4);
    users.push(user5);

    const group1 = await defaultGroupTransformer("group1", "Group 1", "group1@exaple.coom");
    const group2 = await defaultGroupTransformer("group2", "Group 2", "group2@exaple.coom");
    const group3 = await defaultGroupTransformer("group3", "Group 3", "group3@exaple.coom");
    const group4 = await defaultGroupTransformer("group4", "Group 4", "group4@exaple.coom");
    const group5 = await defaultGroupTransformer("group5", "Group 5", "group5@exaple.coom");

    groups.push(group1);
    groups.push(group2);
    groups.push(group3);
    groups.push(group4);
    groups.push(group5);

    return {
        users,
        groups
    }


}

export async function defaultUserTransformer(
    name: string, 
    displayName: string, 
    email: string): Promise<UserEntity> {

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

export async function defaultGroupTransformer(
    name: string, 
    displayName: string, 
    email: string): Promise<GroupEntity> {

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