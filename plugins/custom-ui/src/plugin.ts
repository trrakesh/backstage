import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const customUiPlugin = createPlugin({
  id: 'custom-ui',
  routes: {
    root: rootRouteRef,
  },
});

export const CustomUiPage = customUiPlugin.provide(
  createRoutableExtension({
    name: 'CustomUiPage',
    component: () =>
      import('./components/CustomUIComponent').then(m => m.CustomUIComponent),
    mountPoint: rootRouteRef,
  }),
);
