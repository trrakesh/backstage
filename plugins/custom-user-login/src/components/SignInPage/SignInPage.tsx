import { Content, Header, IdentityProviders, InfoCard, Page, Progress, SignInProviderConfig, UserIdentity } from '@backstage/core-components';
import { SignInPageProps, configApiRef, useApi } from '@backstage/core-plugin-api';
import React, { useState } from 'react';
import { GridItem, useStyles } from './styles';
import { Button, Grid, Typography } from '@material-ui/core';
import { getSignInProviders, useSignInProviders } from './providers';

// type SingleSignInPageProps = SignInPageProps & {
//     onSignInSuccess,
//     providers = [],
//     title,
//     align = 'left',
//     auto?: boolean;
// };

type MultiSignInPageProps = SignInPageProps & {
  align?: 'center' | 'left';
};

export const SingleSignInPage = ({
  onSignInSuccess,
  align = 'center',
}: MultiSignInPageProps) => {
    
    const configApi = useApi(configApiRef);
    const classes = useStyles();  

    const signInProviders = getSignInProviders(['custom']);
    const [loading, providerElements] = useSignInProviders(
      signInProviders,
      onSignInSuccess,
    );
  
    if (loading) {
      return <Progress />;
    }
  
    return (
      <Page themeId="home">
        <Header title={configApi.getString('app.title')} />
        <Content>
          <Grid
            container
            justifyContent={align === 'center' ? align : 'flex-start'}
            spacing={2}
            component="ul"
            classes={classes}
          >
            {providerElements}
          </Grid>
        </Content>
      </Page>
    );
};


export function SignInPage(props: MultiSignInPageProps) {
    return <SingleSignInPage {...props} />;
}
