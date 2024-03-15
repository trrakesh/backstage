import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { customUserLoginPlugin, CustomUserLoginPage } from '../src/plugin';

createDevApp()
  .registerPlugin(customUserLoginPlugin)
  .addPage({
    element: <CustomUserLoginPage />,
    title: 'Root Page',
    path: '/custom-user-login',
  })
  .render();
