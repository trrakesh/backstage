import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  CreateButton
} from '@backstage/core-components';

import { UsersFetchComponent } from '../UsersFetchComponent';

export const UsersComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to User Management" />
    <Content>
      <ContentHeader title="">
        <CreateButton title="Create" to={"/create-user"} />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <UsersFetchComponent />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
