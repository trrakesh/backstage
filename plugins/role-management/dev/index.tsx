import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { roleManagementPlugin, RoleManagementPage } from '../src/plugin';

createDevApp()
  .registerPlugin(roleManagementPlugin)
  .addPage({
    element: <RoleManagementPage />,
    title: 'Root Page',
    path: '/role-management',
  })
  .render();
