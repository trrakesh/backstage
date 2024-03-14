import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'role-management',
});

export const importRouteRef = createRouteRef({
  id: 'import-page',
  params: ['kind'],
});

