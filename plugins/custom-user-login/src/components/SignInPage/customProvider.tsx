import React, { useState } from 'react';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { InfoCard } from "@backstage/core-components";
import Button from '@material-ui/core/Button';
import { makeStyles, Typography } from "@material-ui/core";
import { ProviderComponent, ProviderLoader, SignInProvider } from './types';
import { GridItem } from './styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import isEmpty from 'lodash/isEmpty';
import { Auth, LdapSignInIdentity } from './LdapUserIdentity';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';


/** @public */
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

const Component: ProviderComponent = ({ onSignInSuccess }) => {

    const discoveryApi = useApi(discoveryApiRef);
    const classes = useFormStyles();
    const { register, handleSubmit, formState } = useForm<Auth>({
        mode: 'onChange',
    });
    const { errors } = formState;
    const [ error, setError] = useState('')

    //const [ldapIdentity] = useState(new LdapSignInIdentity({provider: 'ldap', discoveryApi }));
    const [customIdentity] = useState(new LdapSignInIdentity({provider: 'custom', discoveryApi }));
    
    const handleResult = async ({ username, password }: Auth) => {

        // ldapIdentity.login({ username, password })
        // .then(() => {
        //     onSignInSuccess(ldapIdentity);
        // })
        // .catch(_ => {

            customIdentity.login({ username, password })
            .then(() => {
                onSignInSuccess(customIdentity);
            })
            .catch(_ => {
                setError('Invalid username or password');
            })
        //})
    };

    return (
        <GridItem>
            <InfoCard title="Login" variant="fullHeight">
                <form className={classes.form} onSubmit={handleSubmit(handleResult)}>
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
                    <FormControl>
                        <TextField
                            {...asInputRef(register('password', {required: true}) )}
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
                    <Button
                        type="submit"
                        color="primary"
                        variant="outlined"
                        className={classes.button}
                        disabled={!formState?.isDirty || !isEmpty(errors)}>
                        Continue
                    </Button>
                </form>
                <Typography variant="body1" color="error">
                  {error}
                </Typography>
            </InfoCard>
        </GridItem>
    );
};

// Custom provider doesn't store credentials
const loader: ProviderLoader = async () => undefined;

export const customProvider: SignInProvider = { Component, loader };
