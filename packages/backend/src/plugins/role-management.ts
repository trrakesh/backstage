
import { createRouter } from '@internal/backstage-plugin-role-management-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    // config: env.config,
    database: env.database,
    // appPackageName: 'example-app',
  });
}
