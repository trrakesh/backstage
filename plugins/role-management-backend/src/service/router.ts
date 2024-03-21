import { PluginDatabaseManager, errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
//import { ProfileInfo } from '@backstage/core-plugin-api';
import { applyDatabaseMigrations } from '../databases/migrations';
import { getRoles, insertRole, updateRole } from './role-helper';
//import { getImportEntity, getImportEntityFilter, insertImportEntity, updateImportEntity } from './import-entity-helper';
import { RoleManagementData, UserAuth, UserRole, ValidateUserAuth } from '@internal/backstage-plugin-role-management-common';
import { createUserRoles, getUserRoles } from './user-role';
import { getUserPermissions } from './permissions';
import { createUser, validateUser, existUser } from './users';

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

    const insertItem = { info: data.info };
    await insertRole(dbClient, insertItem);

    response.send({ result: 'success' });
  });

  router.put('/', async (request, response) => {
    const data = request.body as RoleManagementData;

    const insertItem = { id: data.id, info: data.info };
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


  router.post('/user-create',  async (request, response) => {
    const data = request.body as UserAuth;
    await createUser(dbClient, data);
    response.json({ status: 'ok' });
  });

  router.post('/user-validate', async (request, response) => {
    const data = request.body as ValidateUserAuth;
    const valid = await validateUser(dbClient, data);
    if (valid) {
      response.json({ status: 'ok' });
    } else {
      response.json({ status: 'notvalid' });
    }
  });

  router.get('/user-exist', async (request, response) => {

    const { query } = request;
    if (query.username) {
      const exist = await existUser(dbClient, query.username as string);
      if (exist) {
        response.json({ status: 'ok' });
      }
    }

    response.json({ status: 'notfound' });
  });

  router.use(errorHandler());
  return router;
}



