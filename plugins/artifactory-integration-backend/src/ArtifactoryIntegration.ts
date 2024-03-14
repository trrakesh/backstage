import {
    ScmIntegration,
    ScmIntegrationsFactory,
    defaultScmResolveUrl
} from '@backstage/integration';


import { basicIntegrations } from './util';
import { ArtifactoryIntegrationConfig, readArtifactoryIntegrationConfigs } from './ArtifactoryIntegrationConfig';

/**
 * Integrates with AWS S3 or compatible solutions.
 *
 * @public
 */
export class ArtifactoryIntegration implements ScmIntegration {
    static factory: ScmIntegrationsFactory<ArtifactoryIntegration> = ({
        config,
    }) => {
        const configs = readArtifactoryIntegrationConfigs(
            config.getOptionalConfigArray('integrations.artifactory') ?? [],
        );
        return basicIntegrations(
            configs.map(c => new ArtifactoryIntegration(c)),
            i => i.config.host,
        );
    };

    get type(): string {
        return 'artifactory';
    }

    get title(): string {
        return this.integrationConfig.host;
    }

    get config(): ArtifactoryIntegrationConfig {
        return this.integrationConfig;
    }

    constructor(
        private readonly integrationConfig: ArtifactoryIntegrationConfig,
    ) { }

    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number | undefined;
    }): string {
        const resolved = defaultScmResolveUrl(options);
        return resolved;
    }

    resolveEditUrl(url: string): string {
        return url;
    }
}
