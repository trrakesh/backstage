
import { createAuthProviderIntegration } from '@backstage/plugin-auth-backend';
import { defaultAuthHandler, defaultCustomAuthentication, defaultSigninResolver, prepareBackstageIdentityResponse } from './auth';
import { COOKIE_FIELD_KEY, CustomJWTTokenValidator, TokenValidator, TokenValidatorNoop, normalizeTime, parseJwtPayload } from './jwt';
import { CookiesOptions, CustomUser, ProviderConstructor, ProviderCreateOptions } from './type';

import {
    AuthProviderRouteHandlers,
    AuthResolverContext,
} from '@backstage/plugin-auth-node';
import { AUTH_MISSING_CREDENTIALS, JWT_INVALID_TOKEN } from './errors';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { AuthenticationError } from '@backstage/errors';

export class CustomAuthProvider implements AuthProviderRouteHandlers {

    private readonly authentication: typeof defaultCustomAuthentication;
    private readonly authHandler: typeof defaultAuthHandler;
    private readonly signInResolver: typeof defaultSigninResolver;
    private readonly resolverContext: AuthResolverContext;
    private readonly jwtValidator: TokenValidator;
    private readonly cookies: CookiesOptions;

    constructor(options: ProviderConstructor) {
        this.authHandler = options.authHandler;
        this.signInResolver = options.signInResolver;
        this.authentication = options.authentication;
        this.resolverContext = options.resolverContext;
        this.cookies = options.cookies as CookiesOptions;
        this.jwtValidator = options.tokenValidator || new TokenValidatorNoop();
    }
    
    async start(): Promise<void> {
        return;
    }
    
    async frameHandler(): Promise<void> {
        return;
    }

    async refresh(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): Promise<void> {
        
        try {
            
            if (req.method !== 'POST') {
                throw new AuthenticationError('Method not allowed');
            }

            const { username, password } = req.body;
            const ctx = this.resolverContext;
            const token = req.cookies?.[this.cookies.field];

            //let result: UserIdentityId;
            let result: CustomUser;

            if (username && password) {

                result = await this.authentication(username, password);

            } else if (token) {

                // this throws if the token is invalid or expired
                await this.jwtValidator.isValid(token as string);

                const { sub } = parseJwtPayload(token as string);

                // user is in format `[<kind>:][<namespace>/]<username>`
                const uid = sub.split(':').at(-1)!.split('/').at(-1);
                result = await this.check(uid as string);

            } else {
                throw new AuthenticationError(AUTH_MISSING_CREDENTIALS);
            }

            // invalidate old token
            if (token) await this.jwtValidator.invalidateToken(token);

            // This is used to return a backstage formated profile object
            const { profile, entity } = await this.authHandler(result, ctx );

            console.log(entity);
            
            // this sign-in the user into backstage and return an object with the token
            const backstageIdentity = await this.signInResolver(entity, ctx);

            const response = {
                providerInfo: {},
                profile,
                // this backstage user information from the token and formats
                // the reponse in way that's usable by the FE
                backstageIdentity: prepareBackstageIdentityResponse(backstageIdentity),
            };

            const { exp } = parseJwtPayload(backstageIdentity.token as string);
            // maxAge value should be relative to now()
            // if it's negative it's expired already
            // should not happen but in case it will trigger browser for login page
            const maxAge = Math.ceil(
                new Date(exp * 1000).valueOf() -
                    new Date().valueOf() +
                    ((this.jwtValidator as CustomJWTTokenValidator)
                        ?.increaseTokenExpireMs || 0)
            );

            res.cookie(this.cookies.field, backstageIdentity.token, {
                maxAge,
                httpOnly: true,
                secure: this.cookies.secure,
            });

            res.json(response);
        } catch (e) {
            res.clearCookie(this.cookies.field);
            throw e;
        }
    }

    async check(uid: string): Promise<CustomUser> {
        // const exists = await this.checkUserExists(
        //     {
        //         ...this.ldapAuthenticationOptions,
        //         username: uid,
        //     },
        //     authenticate
        // );
        // if (!exists) throw new Error(JWT_INVALID_TOKEN);
        if (uid === 'user1') {          
            return {
                username: uid,
            }
        } else {
            throw new Error(JWT_INVALID_TOKEN);
        }
    }

    async logout?(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): Promise<void> {
        const token = req.cookies?.[this.cookies.field];
        // this throws if the token is invalid
        await this.jwtValidator.isValid(token as string);

        this.jwtValidator.logout(token, normalizeTime(Date.now()));

        res.clearCookie(this.cookies.field);
        res.status(200).end();
    }

}


export const normal = createAuthProviderIntegration({
    create(options: ProviderCreateOptions) {
        return ({ resolverContext }) => {
            // const cnf = config.get(
            //     process.env.NODE_ENV || 'development'
            // ) as BackstageLdapAuthConfiguration;

            const cookies = {
                field: COOKIE_FIELD_KEY,
                secure: false,
            };

            const authHandler = defaultAuthHandler;
            const signInResolver = defaultSigninResolver;
            const authentication = defaultCustomAuthentication;

            return new CustomAuthProvider({
                cookies,
                authHandler,
                signInResolver,
                authentication,
                resolverContext,
                tokenValidator: options.tokenValidator,
            });
        };
    },
});
