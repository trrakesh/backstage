
import { ProfileInfo } from '@backstage/core-plugin-api';
//import { AuthHandler } from '@backstage/plugin-auth-backend';

import {
    AuthResolverContext,
//    SignInResolver,
} from '@backstage/plugin-auth-node';

import { parseJwtPayload } from './jwt';
import { AUTH_USER_NOT_FOUND } from './errors';
import { BackstageIdentityResponse, BackstageSignInResult, CustomUser } from './type';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

export const CUSTOM_USER_ANNOTATION = 'custom-user/db-user';

export function prepareBackstageIdentityResponse(
    result: BackstageSignInResult
): BackstageIdentityResponse {
    const { sub, ent } = parseJwtPayload(result.token);

    return {
        ...result,
        identity: {
            type: 'user',
            userEntityRef: sub,
            ownershipEntityRefs: ent || [],
        },
    };
}

export const defaultSigninResolver = async (entity: Entity, ctx: AuthResolverContext): Promise<BackstageSignInResult> => {
    // const backstageIdentity: BackstageSignInResult = await ctx.signInWithCatalogUser({
    //     entityRef: `user:default/${user.username}`,
    // });

    // await ctx.signInWithCatalogUser({
    //     entityRef: result.uid as string,
    // });

    const backstageIdentity = await ctx.issueToken({
        claims: {
          sub: stringifyEntityRef(entity),
          ent: []
        }
      });

    // const s: BackstageSignInResult = {token: token1};
    // return { token: token1 };

    return backstageIdentity;
};

export const defaultAuthHandler = async (
    user: CustomUser, 
    ctx: AuthResolverContext): Promise<{ profile: ProfileInfo, entity: Entity }> => {
    const backstageUserData = await ctx.findCatalogUser({
        annotations: {
            'custom-user/db-user': user.username,
        },
    });
    return { 
        profile: backstageUserData?.entity?.spec?.profile as ProfileInfo,
        entity: backstageUserData?.entity as Entity
    };
};

// export const defaultCheckUserExists = async (
//     authOptions: AuthenticationOptions
// ): Promise<boolean> => {
//     const {
//         username,
//     } = authOptions;

//     if (username == 'admin') {
//         return true;
//     }

//     return false;
// };

export async function defaultCustomAuthentication(
    username: string,
    password: string,
): Promise<CustomUser> {
   
    try {
        if (username == 'user1' && password == 'user1') {
            return { username }
        }
        throw new Error(AUTH_USER_NOT_FOUND); 
    } catch (e) {
        console.error(
            'There was an error when trying to login with db-authentication'
        );
        throw e;
    }
}
