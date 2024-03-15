import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { RoleMappingApiClient, roleMappingApiRef } from './apis';

export const userManagementPlugin = createPlugin({
  id: 'user-management',
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

export const UserManagementPage = userManagementPlugin.provide(
  createRoutableExtension({
    name: 'UserManagementPage',
    component: () =>
      import('./components/UsersComponent').then(m => m.UsersComponent),
    mountPoint: rootRouteRef,
  }),
);

export const GroupManagementPage = userManagementPlugin.provide(
  createRoutableExtension({
    name: 'GroupManagementPage',
    component: () =>
      import('./components/GroupsComponent').then(m => m.GroupsComponent),
    mountPoint: rootRouteRef,
  }),
);

export const RoleManagementPage = userManagementPlugin.provide(
  createRoutableExtension({
    name: 'RolesManagementPage',
    component: () =>
      import('./components/RolesComponent').then(m => m.RolesComponent),
    mountPoint: rootRouteRef,
  }),
);

export const CreateRolePage = userManagementPlugin.provide(
  createRoutableExtension({
    name: 'CreateRolesManagementPage',
    component: () =>
      import('./components/CreateRoleComponent').then(m => m.CreateRolesComponent),
    mountPoint: rootRouteRef,
  }),
);


export const RoleSelectionCard = userManagementPlugin.provide(
  createComponentExtension({
    name: 'RoleSelectionCard',
    component: {
      lazy: () => import('./components/RoleSelectionCard').then(m => m.RoleSelectionCard),
    },
  }),
);
