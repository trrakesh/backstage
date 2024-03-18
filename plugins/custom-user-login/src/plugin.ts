import { createPlugin } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const customUserLoginPlugin = createPlugin({
  id: 'custom-user-login',
  routes: {
    root: rootRouteRef,
  },
});

// export const CustomUserLoginPage = customUserLoginPlugin.provide(
//   createRoutableExtension({
//     name: 'CustomUserLoginPage',
//     component: () =>
//       import('./components/ExampleComponent').then(m => m.ExampleComponent),
//     mountPoint: rootRouteRef,
//   }),
// );
