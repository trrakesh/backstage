import { ComponentType } from 'react';
import {
  SignInPageProps,
  ApiHolder,
  ApiRef,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

export type SignInProviderConfig = {
  id: string;
  title: string;
  message: string;
  apiRef: ApiRef<ProfileInfoApi & BackstageIdentityApi & SessionApi>;
};

/** @public */
export type IdentityProviders = ('guest' | 'custom' | SignInProviderConfig)[];

/**
 * Invoked when the sign-in process has failed.
 */
export type onSignInFailure = () => void;
/**
 * Invoked when the sign-in process has started.
 */
export type onSignInStarted = () => void;

export type ProviderComponent = ComponentType<
  SignInPageProps & {
    config: SignInProviderConfig;
    onSignInStarted(): void;
    onSignInFailure(): void;
  }
>;

export type ProviderLoader = (
  apis: ApiHolder,
  apiRef: ApiRef<ProfileInfoApi & BackstageIdentityApi & SessionApi>,
) => Promise<IdentityApi | undefined>;

export type SignInProvider = {
  Component: ProviderComponent;
  loader: ProviderLoader;
};
