import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const userManagementPlugin = createPlugin({
  id: 'user-management',
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
