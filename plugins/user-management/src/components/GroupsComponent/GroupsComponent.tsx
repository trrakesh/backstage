import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content
} from '@backstage/core-components';

import { GroupsFetchComponent } from '../GroupsFetchComponent';

export const GroupsComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to Group Management" />
    <Content>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <GroupsFetchComponent />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
