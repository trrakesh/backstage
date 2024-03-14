import { Config } from '@backstage/config';

/**
 * The configuration parameters for a single Artifactory provider.
 *
 * @public
 */
export type ArtifactoryIntegrationConfig = {
  /**
   * Host, derived from endpoint, and defaults to amazonaws.com
   */
  host: string;

  /**
   * (Optional) User secret access key
   */
  secretAccessKey?: string;
};

/**
 * Reads a single Artifactory integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */

export function readArtifactoryIntegrationConfig(
  config: Config,
): ArtifactoryIntegrationConfig {
  let host;

  const rootUrl = config.getOptionalString('host');

  if (rootUrl) {
    try {
      const url = new URL(rootUrl);
      host = url.host;
    } catch {
      throw new Error(
        `invalid Artifactory integration config, host '${rootUrl}' is not a valid URL`,
      );
    }
  } else {
    throw new Error(
      `invalid Artifactory integration config, host '${rootUrl}' is not a valid URL`,
    );
  }

  const secretAccessKey = config.getOptionalString('secretAccessKey');

  return {
    host,
    secretAccessKey,
  };
}

/**
 * Reads a set of Artifactory integration configs, and inserts some defaults for
 * public Amazon AWS if not specified.
 *
 * @param configs - The config objects of the integrations
 * @public
 */
export function readArtifactoryIntegrationConfigs(
  configs: Config[],
): ArtifactoryIntegrationConfig[] {
  // First read all the explicit integrations
  const result = configs.map(readArtifactoryIntegrationConfig);
  return result;
}
