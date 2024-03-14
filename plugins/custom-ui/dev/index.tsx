import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { customUiPlugin, CustomUiPage } from '../src/plugin';

createDevApp()
  .registerPlugin(customUiPlugin)
  .addPage({
    element: <CustomUiPage />,
    title: 'Root Page',
    path: '/custom-ui',
  })
  .render();
