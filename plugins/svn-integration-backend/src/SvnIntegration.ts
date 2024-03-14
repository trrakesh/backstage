import {
    ScmIntegration,
    ScmIntegrationsFactory,
    defaultScmResolveUrl
  } from '@backstage/integration';
  
import { basicIntegrations } from './util';
import { SvnIntegrationConfig, readSvnIntegrationConfigs } from './SvnIntegrationConfig';
  
  /**
   * Integrates with SVN or compatible solutions.
   *
   * @public
   */
  export class SvnIntegration implements ScmIntegration {
    static factory: ScmIntegrationsFactory<SvnIntegration> = ({ config }) => {
      const configs = readSvnIntegrationConfigs(
        config.getOptionalConfigArray('integrations.svn') ?? [],
      );
      return basicIntegrations(
        configs.map(c => new SvnIntegration(c)),
        i => i.config.host,
      );
    };
  
    get type(): string {
      return 'svn';
    }
  
    get title(): string {
      return this.integrationConfig.host;
    }
  
    get config(): SvnIntegrationConfig {
      return this.integrationConfig;
    }
  
    constructor(private readonly integrationConfig: SvnIntegrationConfig) { }
  
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
  
  
  