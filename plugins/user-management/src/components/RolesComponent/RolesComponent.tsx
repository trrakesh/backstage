import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content
} from '@backstage/core-components';

import { RolesFetchComponent } from '../RolesFetchComponent';

export const RolesComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to Role Management" />
    <Content>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <RolesFetchComponent />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
