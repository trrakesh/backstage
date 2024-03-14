import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { userManagementPlugin, UserManagementPage } from '../src/plugin';

createDevApp()
  .registerPlugin(userManagementPlugin)
  .addPage({
    element: <UserManagementPage />,
    title: 'Root Page',
    path: '/user-management',
  })
  .render();
