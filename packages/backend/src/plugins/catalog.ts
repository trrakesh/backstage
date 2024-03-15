import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

import { ProductEntitiesProcessor } from "@internal/backstage-plugin-custom-entity-backend";
import { ConfluenceUpdateProcess } from "@internal/backstage-plugin-confluence-calalog-backend";

import { UserEntityProvider } from "@internal/backstage-plugin-custom-user-backend";

import {
  LdapOrgEntityProvider,
  LdapOrgReaderProcessor,
} from '@backstage/plugin-catalog-backend-module-ldap';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {

  const builder = await CatalogBuilder.create(env);


  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(new ProductEntitiesProcessor());
  builder.addProcessor(new ConfluenceUpdateProcess(env.config));

  builder.addProcessor(
    LdapOrgReaderProcessor.fromConfig(env.config, {
      logger: env.logger,
    }),
  );

  // The target parameter below needs to match the ldap.providers.target
  // value specified in your app-config.
  builder.addEntityProvider(
    LdapOrgEntityProvider.fromConfig(env.config, {
      id: 'our-ldap-master',
      target: 'ldap://57.180.241.191:389',
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 60 },
        timeout: { minutes: 15 },
      }),
    }),
  );

  builder.addEntityProvider(UserEntityProvider.fromConfig(
    env.logger,
    env.scheduler.createScheduledTaskRunner({
      frequency: { minutes: 60 },
      timeout: { minutes: 15 },
    }),
  ));

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  return router;
}
