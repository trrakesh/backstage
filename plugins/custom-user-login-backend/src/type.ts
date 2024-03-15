import { 
    defaultAuthHandler, 
    // /defaultCheckUserExists, 
    defaultCustomAuthentication, 
    defaultSigninResolver 
} from "./auth";

import { TokenValidator } from "./jwt";

import {
    AuthResolverContext,
} from '@backstage/plugin-auth-node';

export type BackstageJWTPayload = {
    iss: string;
    sub: string;
    ent: string[];
    aud: string;
    iat: number;
    exp: number;
};

export type CookiesOptions = {
    field: string;
    secure: boolean;
};

// export type AuthenticationOptions = {
//     username: string;
//     password: string;
// }

/**
 * A representation of a successful Backstage sign-in.
 *
 * Compared to the {@link BackstageIdentityResponse} this type omits
 * the decoded identity information embedded in the token.
 *
 * @public
 */
export interface BackstageSignInResult {
    /**
     * The token used to authenticate the user within Backstage.
     */
    token: string;
}

/**
 * Response object containing the {@link BackstageUserIdentity} and the token
 * from the authentication provider.
 *
 * @public
 */
export interface BackstageIdentityResponse extends BackstageSignInResult {
    /**
     * A plaintext description of the identity that is encapsulated within the token.
     */
    identity: BackstageUserIdentity;
}

/**
 * User identity information within Backstage.
 *
 * @public
 */
export type BackstageUserIdentity = {
    /**
     * The type of identity that this structure represents. In the frontend app
     * this will currently always be 'user'.
     */
    type: 'user';

    /**
     * The entityRef of the user in the catalog.
     * For example User:default/sandra
     */
    userEntityRef: string;

    /**
     * The user and group entities that the user claims ownership through
     */
    ownershipEntityRefs: string[];
};


export type ProviderCreateOptions = {
    // Backstage Provider AuthHandler
    authHandler?: typeof defaultAuthHandler;
    // Backstage Provider SignInResolver
    signIn?: {
        resolver?: typeof defaultSigninResolver;
    };

    // Custom resolvers
    resolvers?: {
        authentication?: typeof defaultCustomAuthentication;
    };
    // Custom validator function for the JWT token if needed
    tokenValidator?: TokenValidator;
};

export type BackstageCustomAuthConfiguration = {
    cookies?: Partial<CookiesOptions>;
};

export type ProviderConstructor = {
    cookies: BackstageCustomAuthConfiguration['cookies'];
    authHandler: typeof defaultAuthHandler;
    signInResolver: typeof defaultSigninResolver;
    authentication: typeof defaultCustomAuthentication;
    resolverContext: AuthResolverContext;
    tokenValidator?: TokenValidator;
};

export type CustomUser = {
    username: string;
    // email: string;
    // uid: string;
}