import { PluginDatabaseManager, errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
//import { ProfileInfo } from '@backstage/core-plugin-api';
import { applyDatabaseMigrations } from '../databases/migrations';
import { getRoles, insertRole, updateRole } from './role-helper';
//import { getImportEntity, getImportEntityFilter, insertImportEntity, updateImportEntity } from './import-entity-helper';
import { ImportEntityData, ImportEntityFilter, RoleManagementData, RolePermissonData, UserRole } from '@internal/backstage-plugin-role-management-common';
import { createUserRoles, getUserRoles } from './user-role';
import { getUserPermissions } from './permissions';

export interface RouterOptions {
  logger: Logger;
  database: PluginDatabaseManager;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {

  const { logger, database } = options;
  const dbClient = await database.getClient();

  await applyDatabaseMigrations(dbClient);

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/hello', (_, response) => {
    logger.info('Get hello request!');
    response.send({ status: 'hello' });
  });

  router.get('/', async (_, response) => {
    const items = await getRoles(dbClient);
    response.send(items);
  });

  router.post('/', async (request, response) => {
    const data = request.body as RoleManagementData;

    const insertItem = { info: JSON.stringify(data.info) };
    await insertRole(dbClient, insertItem);

    response.send({ result: 'success' });
  });

  router.put('/', async (request, response) => {
    const data = request.body as RoleManagementData;

    const insertItem = { id: data.id, info: JSON.stringify(data.info) };
    await updateRole(dbClient, insertItem);

    response.send({ result: 'success' });
  });

  router.get('/user-role', async (request, response) => {
    const { query } = request;
    if (query.name) {
      const item = await getUserRoles(dbClient, query.name as string);
      response.send(item);
    }
  });

  router.post('/user-role', async (request, response) => {
    const data = request.body as UserRole;
    const insertItem = { 
      id: data.id,
      name: data.name,
      roles: JSON.stringify(data.roles),
    };
    await createUserRoles(dbClient, insertItem);
    response.send({ result: 'success' });
  });


  router.get('/user-role-permission', async (request, response) => {
    const { query } = request;
    if (query.name) {
      const item = await getUserPermissions(dbClient, query.name as string);
      response.send(item);
    }
  });


  // router.get('/import-entity', async (request, response) => {
  //   const { query } = request;

  //   if (query.kind) {

  //     const filterParts = {kind: query.kind} as ImportEntityFilter;
  //     const items = await getImportEntityFilter(dbClient, filterParts);

  //     response.send(items);

  //   } else {
  //     const items = await getImportEntity(dbClient);
      
  //     response.send(items);
  //   }
  // });

  // // router.get('/import-entity/profile', async (request, response) => {
  // //   const { query } = request;

  // //   if (query && query.mail) {

  // //     const items = await getImportEntity(dbClient);
  // //     const found = items.find(x => {
  // //       const profile = x.entity.spec?.profile as ProfileInfo
  // //       return profile.email == query.mail
  // //     });

  // //     if (found) {
  // //       const importEntityData = found as ImportEntityData;
  // //       const rolenames = importEntityData.roles;

  // //       const roles = await getRoles(dbClient);
  // //       const currentRole = roles.find(x => x.info.roleName === rolenames[0]);
  // //       if (currentRole) {
  // //         response.send(currentRole.info.data);
  // //         return;
  // //       }
  // //     }
  // //     response.send([] as RolePermissonData[]);
  // //   }
  // // });

  // // router.post('/import-entity', async (request, response) => {
  // //   const data = request.body as ImportEntityData;

  // //   const insertItem = { 
  // //     kind: data.kind,
  // //     entity: JSON.stringify(data.entity),
  // //     groups: JSON.stringify(data.groups),
  // //     roles: JSON.stringify(data.roles),
  // //   };
  // //   await insertImportEntity(dbClient, insertItem);

  // //   response.send({ result: 'success' });
  // // });

  // // router.put('/import-entity', async (request, response) => {
  // //   const data = request.body as ImportEntityData;

  // //   const insertItem = { 
  // //     id: data.id,
  // //     kind: data.kind,
  // //     entity: JSON.stringify(data.entity),
  // //     groups: JSON.stringify(data.groups),
  // //     roles: JSON.stringify(data.roles),
  // //   };
  // //   await updateImportEntity(dbClient, insertItem);

  // //   response.send({ result: 'success' });
  // // });

  router.use(errorHandler());
  return router;
}



