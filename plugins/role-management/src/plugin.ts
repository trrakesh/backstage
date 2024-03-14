import { createApiFactory, createPlugin, createRoutableExtension, discoveryApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { importRouteRef, rootRouteRef } from './routes';
import { RoleMappingApiClient, roleMappingApiRef } from './apis';

export const roleManagementPlugin = createPlugin({
  id: 'role-management',
  apis: [
    createApiFactory({
      api: roleMappingApiRef,
      deps: {
        identityApi: identityApiRef,
        discoveryApi: discoveryApiRef,
      },
      factory({ identityApi, discoveryApi }) {
        return new RoleMappingApiClient({ identityApi, discoveryApi });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const RoleManagementPage = roleManagementPlugin.provide(
  createRoutableExtension({
    name: 'RoleManagementPage',
    component: () =>
      import('./components/RolesPage').then(m => m.RolesPage),
    mountPoint: rootRouteRef,
  }),
);

export const UserMappingPage = roleManagementPlugin.provide(
  createRoutableExtension({
    name: 'UserMappingPage',
    component: () =>
      import('./components/MappingPage').then(m => m.UserMappingComponent),
    mountPoint: rootRouteRef,
  }),
);

export const GroupMappingPage = roleManagementPlugin.provide(
  createRoutableExtension({
    name: 'GroupMappingPage',
    component: () =>
      import('./components/MappingPage').then(m => m.GroupMappingComponent),
    mountPoint: rootRouteRef,
  }),
);

export const ImportPage = roleManagementPlugin.provide(
  createRoutableExtension({
    name: 'ImportPage',
    component: () =>
      import('./components/MappingPage').then(m => m.ImportComponent),
    mountPoint: importRouteRef,
  }),
);