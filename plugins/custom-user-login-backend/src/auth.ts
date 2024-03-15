
import { ProfileInfo } from '@backstage/core-plugin-api';
import { AuthHandler } from '@backstage/plugin-auth-backend';

import {
    AuthResolverContext,
    SignInResolver,
} from '@backstage/plugin-auth-node';

import { parseJwtPayload } from './jwt';
import { CustomUser } from './CustomUser';
// import { AuthenticationOptions } from './type';
import { AUTH_USER_NOT_FOUND } from './errors';
import { BackstageIdentityResponse, BackstageSignInResult } from './type';

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

export const defaultSigninResolver: SignInResolver<CustomUser> = async ({ result },
    ctx: AuthResolverContext
): Promise<BackstageSignInResult> => {
    const backstageIdentity: BackstageSignInResult =
        await ctx.signInWithCatalogUser({
            entityRef: result.uid,
        });

    return backstageIdentity;
};

export const defaultAuthHandler: AuthHandler<CustomUser> = async (
    { uid },
    ctx: AuthResolverContext
): Promise<{ profile: ProfileInfo }> => {
    const backstageUserData = await ctx.findCatalogUser({
        entityRef: uid as string,
    });
    return { profile: backstageUserData?.entity?.spec?.profile as ProfileInfo };

    // return { profile: {
    //     email: "admin@example.com",
    //     displayName: "Admin"
    // }}
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
        if (username == 'admin' && password == 'admin') {
            return {
                username: 'admin',
                uid: 'user:default/rakesh',
                email: 'admin@example.com'
            }
        }
        throw new Error(AUTH_USER_NOT_FOUND); 
    } catch (e) {
        console.error(
            'There was an error when trying to login with ldap-authentication'
        );
        throw e;
    }
}
