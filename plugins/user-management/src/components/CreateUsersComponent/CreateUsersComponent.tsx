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
import Snackbar from '@mui/material/Snackbar';
import {useNavigate} from 'react-router-dom';


export type CustomProviderClassKey = 'form' | 'button';

const useFormStyles = makeStyles(
  theme => ({
    form: {
      display: 'flex',
      flexFlow: 'column nowrap',
      alignContent: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '500px',
      padding: theme.spacing(4),
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[2],
      marginTop: theme.spacing(8)

    },
    button: {
      alignSelf: 'center',
      marginTop: theme.spacing(4),
      justifyContent: 'center'
    },
    textField: {
      marginLeft: theme.spacing(8),
      width: '300px'
    }
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
  const navigate = useNavigate();
  //const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<UserAuth>({
    mode: 'onChange',
  });
  const { errors } = formState;
  // const [ error, setError] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnakbarMessage] = useState('');

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
    setOpenSnackbar(true);
    setSnakbarMessage('Created successfully');
    setTimeout(()=>{
      setOpenSnackbar(false);
      navigate('/user-management');
    },3000)

  };

  return (
    <Page themeId="tool">
      <Header title="Create User" />
      <Content>
        <Grid container alignItems='center' justifyContent='center' >
          <form className={classes.form} onSubmit={handleSubmit(handleResult)}>
            <Grid container spacing={3} direction="column">
              <Grid item>
                <FormControl>
                  <TextField
                    {...asInputRef(register('display', { required: true }))}
                    label="Display Name"
                    margin="normal"
                    className={classes.textField}
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
                    className={classes.textField}
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
                    className={classes.textField}
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
                    className={classes.textField}
                    error={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <FormHelperText error>{errors.email.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            <Grid item container justifyContent='center' alignItems='center'>
              <Button
                type="submit"
                color="primary"
                variant="outlined"
                className={classes.button}
                disabled={!formState?.isDirty || !isEmpty(errors)}>
                Create
              </Button>
              <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                style={{ alignItems: 'center' }}
              />
            </Grid>
          </form>
        </Grid>
      </Content>
    </Page>
  );
}
