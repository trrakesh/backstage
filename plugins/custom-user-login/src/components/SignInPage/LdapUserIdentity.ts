import {
    BackstageUserIdentity,
    discoveryApiRef,
    IdentityApi,
    ProfileInfo,
} from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { LdapSession, ldapSessionSchema } from './LdapTypes';

export const DEFAULTS = {
    // The amount of time between token refreshes, if we fail to get an actual
    // value out of the exp claim
    defaultTokenExpiryMillis: 5 * 60 * 1000,
    // The amount of time before the actual expiry of the Backstage token, that we
    // shall start trying to get a new one
    tokenExpiryMarginMillis: 5 * 60 * 1000,
} as const;

// When the token expires, with some margin
export function tokenToExpiry(jwtToken: string | undefined): Date {
    const fallback = new Date(Date.now() + DEFAULTS.defaultTokenExpiryMillis);
    if (!jwtToken) {
        return fallback;
    }

    const [_header, rawPayload, _signature] = jwtToken.split('.');
    const payload = JSON.parse(atob(rawPayload));
    if (typeof payload.exp !== 'number') {
        return fallback;
    }

    return new Date(payload.exp * 1000 - DEFAULTS.tokenExpiryMarginMillis);
}

type ProxiedSignInIdentityOptions = {
    provider: string;
    discoveryApi: typeof discoveryApiRef.T;
};

type State =
    | {
          type: 'empty';
      }
    | {
          type: 'fetching';
          promise: Promise<LdapSession>;
          previous: LdapSession | undefined;
      }
    | {
          type: 'active';
          session: LdapSession;
          expiresAt: Date;
      }
    | {
          type: 'failed';
          error: Error;
      };

export type Auth = { username: string; password: string };

/**
 * An identity API that gets the user auth information solely based on a
 * provider's `/refresh` endpoint.
 */
export class LdapSignInIdentity implements IdentityApi {
    private readonly options: ProxiedSignInIdentityOptions;
    private readonly abortController: AbortController;
    private state: State;

    constructor(options: ProxiedSignInIdentityOptions) {
        this.options = options;
        this.abortController = new AbortController();
        this.state = { type: 'empty' };
    }

    async login(auth: Auth) {
        // Try to make a first fetch, bubble up any errors to the caller
        await this.loginAsync(auth);
    }

    async fetch(forceRefresh?: boolean) {
        await this.getSessionAsync(forceRefresh);
    }

    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getUserId} */
    getUserId(): string {
        const { backstageIdentity } = this.getSessionSync();
        const ref = backstageIdentity.identity.userEntityRef;
        const match = /^([^:/]+:)?([^:/]+\/)?([^:/]+)$/.exec(ref);
        if (!match) {
            throw new TypeError(`Invalid user entity reference "${ref}"`);
        }

        return match[3];
    }

    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getIdToken} */
    async getIdToken(): Promise<string | undefined> {
        const session = await this.getSessionAsync();
        return session.backstageIdentity.token;
    }

    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getProfile} */
    getProfile(): ProfileInfo {
        const session = this.getSessionSync();
        return session.profile;
    }

    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getProfileInfo} */
    async getProfileInfo(): Promise<ProfileInfo> {
        const session = await this.getSessionAsync();
        return session.profile;
    }

    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getBackstageIdentity} */
    async getBackstageIdentity(): Promise<BackstageUserIdentity> {
        const session = await this.getSessionAsync();
        return session.backstageIdentity.identity;
    }

    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getCredentials} */
    async getCredentials(): Promise<{ token?: string | undefined }> {
        const session = await this.getSessionAsync();
        return {
            token: session.backstageIdentity.token,
        };
    }

    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.signOut} */
    async signOut(): Promise<void> {
        this.abortController.abort();
        const token = await this.getIdToken();
        const baseUrl = await this.options.discoveryApi.getBaseUrl('auth');
        await fetch(`${baseUrl}/${this.options.provider}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token: token as string }),
        });
    }

    getSessionSync(): LdapSession {
        if (this.state.type === 'active') {
            return this.state.session;
        } else if (this.state.type === 'fetching' && this.state.previous) {
            return this.state.previous;
        }
        throw new Error(
            'No session available. Try reloading your browser page.'
        );
    }

    async getSessionAsync(forceRefresh?: boolean): Promise<LdapSession> {
        if (this.state.type === 'fetching') {
            return this.state.promise;
        } else if (
            this.state.type === 'active' &&
            new Date() < this.state.expiresAt &&
            !forceRefresh
        ) {
            return this.state.session;
        }

        const previous =
            this.state.type === 'active' ? this.state.session : undefined;

        const promise = this.fetchSession().then(
            (session) => {
                this.state = {
                    type: 'active',
                    session,
                    expiresAt: tokenToExpiry(session.backstageIdentity.token),
                };
                return session;
            },
            (error) => {
                this.state = {
                    type: 'failed',
                    error,
                };
                throw error;
            }
        );

        this.state = {
            type: 'fetching',
            promise,
            previous,
        };

        return promise;
    }

    async loginAsync(auth: Auth): Promise<LdapSession> {
        if (this.state.type === 'fetching') {
            return this.state.promise;
        } else if (
            this.state.type === 'active' &&
            new Date() < this.state.expiresAt
        ) {
            return this.state.session;
        }

        const previous =
            this.state.type === 'active' ? this.state.session : undefined;

        const promise = this.fetchSessionWithAuth(auth).then(
            (session) => {
                this.state = {
                    type: 'active',
                    session,
                    expiresAt: tokenToExpiry(session.backstageIdentity.token),
                };
                return session;
            },
            (error) => {
                this.state = {
                    type: 'failed',
                    error,
                };
                throw error;
            }
        );

        this.state = {
            type: 'fetching',
            promise,
            previous,
        };

        return promise;
    }

    async fetchSessionWithAuth(auth: Auth): Promise<LdapSession> {
        const baseUrl = await this.options.discoveryApi.getBaseUrl('auth');

        // Note that we do not use the fetchApi here, since this all happens before
        // sign-in completes so there can be no automatic token injection and
        // similar.
        const response = await fetch(
            `${baseUrl}/${this.options.provider}/refresh`,
            {
                method: 'POST',
                signal: this.abortController.signal,
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(auth),
            }
        );

        if (!response.ok) {
            throw await ResponseError.fromResponse(response);
        }

        return ldapSessionSchema.parse(await response.json());
    }

    async fetchSession(): Promise<LdapSession> {
        const baseUrl = await this.options.discoveryApi.getBaseUrl('auth');

        // Note that we do not use the fetchApi here, since this all happens before
        // sign-in completes so there can be no automatic token injection and
        // similar.
        const response = await fetch(
            `${baseUrl}/${this.options.provider}/refresh`,
            {
                method: 'POST',
                signal: this.abortController.signal,
                headers: { 'x-requested-with': 'XMLHttpRequest' },
                credentials: 'include',
            }
        );

        if (!response.ok) {
            throw await ResponseError.fromResponse(response);
        }

        return ldapSessionSchema.parse(await response.json());
    }
}
