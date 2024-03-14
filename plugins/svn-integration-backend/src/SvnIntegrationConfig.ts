import { Config } from '@backstage/config';

/**
 * The configuration parameters for a single SVN provider.
 *
 * @public
 */
export type SvnIntegrationConfig = {
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
 * Reads a single SVN integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */

export function readSvnIntegrationConfig(config: Config): SvnIntegrationConfig {
  let host;

  const rootUrl = config.getOptionalString('host');

  if (rootUrl) {
    try {
      const url = new URL(rootUrl);
      host = url.host;
    } catch {
      throw new Error(
        `invalid SVN integration config, rootUrl '${rootUrl}' is not a valid URL`,
      );
    }
  } else {
    throw new Error(
      `invalid SVN integration config, rootUrl '${rootUrl}' is not a valid URL`,
    );
  }

  const secretAccessKey = config.getOptionalString('secretAccessKey');

  return {
    host,
    secretAccessKey,
  };
}

/**
 * Reads a set of SVN integration configs, and inserts some defaults for
 * public Amazon AWS if not specified.
 *
 * @param configs - The config objects of the integrations
 * @public
 */
export function readSvnIntegrationConfigs(
  configs: Config[],
): SvnIntegrationConfig[] {
  // First read all the explicit integrations
  const result = configs.map(readSvnIntegrationConfig);
  return result;
}
