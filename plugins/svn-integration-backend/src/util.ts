import {
    ScmIntegration,
    ScmIntegrationsGroup,
} from '@backstage/integration';

export function parseLastModified(value: string | null | undefined) {
    if (!value) {
        return undefined;
    }
    return new Date(value);
}

export function basicIntegrations<T extends ScmIntegration>(
    integrations: T[],
    getHost: (integration: T) => string,
): ScmIntegrationsGroup<T> {
    return {
        list(): T[] {
            return integrations;
        },
        byUrl(url: string | URL): T | undefined {
            try {
                const parsed = typeof url === 'string' ? new URL(url) : url;
                return integrations.find(i => getHost(i) === parsed.host);
            } catch {
                return undefined;
            }
        },
        byHost(host: string): T | undefined {
            return integrations.find(i => getHost(i) === host);
        },
    };
}