import React, { useState } from 'react';
import { Button, FormControl, FormHelperText, Grid, TextField } from '@material-ui/core';

import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { makeStyles } from "@material-ui/core";
import isEmpty from 'lodash/isEmpty';


import {
  Header,
  Page,
  Content,
  ContentHeader,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { roleMappingApiRef } from '../../apis';
import { UserAuth } from "@internal/backstage-plugin-role-management-common";


export type CustomProviderClassKey = 'form' | 'button';

const useFormStyles = makeStyles(
  theme => ({
    form: {
      display: 'flex',
      flexFlow: 'column nowrap',
    },
    button: {
      alignSelf: 'center',
      marginTop: theme.spacing(2),
    },
  }),
  { name: 'BackstageCustomProvider' },
);

const asInputRef = (renderResult: UseFormRegisterReturn) => {
  const { ref, ...rest } = renderResult;
  return {
    inputRef: ref,
    ...rest,
  };
};

export const CreateUsersComponent = () => {

  const userApi = useApi(roleMappingApiRef);
  const classes = useFormStyles();
  //const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<UserAuth>({
    mode: 'onChange',
  });
  const { errors } = formState;
  // const [ error, setError] = useState('')

  const handleCreateButtonClick = async () => {

    debugger;
    //setShowPassword(!showPassword);
  };

  // const handleClickShowPassword = async () => {
  //   setShowPassword(!showPassword);
  // };

  // const handleMouseDownPassword = async () => {

  // };


  const handleResult = async ({ username, password, email, display }: UserAuth) => {
    debugger;
    userApi.createUser({
      username, password, email, display
    })

  };

  return (
    <Page themeId="tool">
      <Header title="Create User" />
      <Content>
        <form className={classes.form} onSubmit={handleSubmit(handleResult)}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <FormControl>
                <TextField
                  {...asInputRef(register('display', { required: true }))}
                  label="Dsiplay Name"
                  margin="normal"
                  error={Boolean(errors.display)}
                />
                {errors.display && (
                  <FormHelperText error>{errors.display.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl>
                <TextField
                  {...asInputRef(register('username', { required: true }))}
                  label="User ID"
                  margin="normal"
                  error={Boolean(errors.username)}
                />
                {errors.username && (
                  <FormHelperText error>{errors.username.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl>
                <TextField
                  {...asInputRef(register('password', { required: true }))}
                  label="Password"
                  margin="normal"
                  autoComplete="off"
                  type='password'
                  error={Boolean(errors.password)}
                />
                {errors.password && (
                  <FormHelperText error>{errors.password.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl>
                <TextField
                  {...asInputRef(register('email', { required: true }))}
                  label="Email"
                  margin="normal"
                  error={Boolean(errors.email)}
                />
                {errors.email && (
                  <FormHelperText error>{errors.email.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
          <Button
            type="submit"
            color="primary"
            variant="outlined"
            className={classes.button}
            disabled={!formState?.isDirty || !isEmpty(errors)}>
            Create
          </Button>
        </form>
      </Content>
    </Page>
  );
}
