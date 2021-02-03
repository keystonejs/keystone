/* @jsx jsx */

import { useState, FormEvent, useRef, useEffect } from 'react';

import { jsx, H1, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { TextInput } from '@keystone-ui/fields';
import { Notice } from '@keystone-ui/notice';

import { SigninContainer } from '../components/SigninContainer';
import { useMutation, gql } from '@keystone-next/admin-ui/apollo';
import { useRawKeystone, useReinitContext } from '@keystone-next/admin-ui/context';
import { useRouter } from '@keystone-next/admin-ui/router';

export const SigninPage = ({
  identityField,
  secretField,
  mutationName,
  successTypename,
  failureTypename,
}: {
  identityField: string;
  secretField: string;
  mutationName: string;
  successTypename: string;
  failureTypename: string;
}) => {
  const mutation = gql`
    mutation($identity: String!, $secret: String!) {
      authenticate: ${mutationName}(${identityField}: $identity, ${secretField}: $secret) {
        ... on ${successTypename} {
          item {
            id
          }  
        }
        ... on ${failureTypename} {
          message
        }
      }
    }
  `;

  const [mode, setMode] = useState<'signin' | 'forgot password'>('signin');
  const [state, setState] = useState({ identity: '', secret: '' });

  const identityFieldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    identityFieldRef.current?.focus();
  }, [mode]);

  const [mutate, { error, loading, data }] = useMutation(mutation);
  const reinitContext = useReinitContext();
  const router = useRouter();
  const rawKeystone = useRawKeystone();

  useEffect(() => {
    if (rawKeystone.authenticatedItem.state === 'authenticated') {
      router.push((router.query.from as string | undefined) || '/');
    }
  }, [rawKeystone.authenticatedItem, router.query.from]);
  return (
    <SigninContainer>
      <Stack
        gap="xlarge"
        as="form"
        onSubmit={async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();

          if (mode === 'signin') {
            try {
              let result = await mutate({
                variables: {
                  identity: state.identity,
                  secret: state.secret,
                },
              });
              if (result.data.authenticate?.__typename !== successTypename) {
                return;
              }
            } catch (err) {
              return;
            }
            reinitContext();
            router.push((router.query.from as string | undefined) || '/');
          }
        }}
      >
        <H1>Sign In</H1>
        {error && (
          <Notice title="Error" tone="negative">
            {error.message}
          </Notice>
        )}
        {data?.authenticate?.__typename === failureTypename && (
          <Notice title="Error" tone="negative">
            {data?.authenticate.message}
          </Notice>
        )}
        <Stack gap="medium">
          <TextInput
            name="identity"
            value={state.identity}
            onChange={e => setState({ ...state, identity: e.target.value })}
            placeholder="Email Address"
            ref={identityFieldRef}
          />
          {mode === 'signin' && (
            <TextInput
              name="password"
              value={state.secret}
              onChange={e => setState({ ...state, secret: e.target.value })}
              placeholder="password"
              type="password"
            />
          )}
        </Stack>

        {mode === 'forgot password' ? (
          <Stack gap="medium" across>
            <Button type="submit" weight="bold" tone="active">
              Log reset link
            </Button>
            <Button weight="none" tone="active" onClick={() => setMode('signin')}>
              Go back
            </Button>
          </Stack>
        ) : (
          <Stack gap="medium" across>
            <Button
              weight="bold"
              tone="active"
              isLoading={
                loading ||
                // this is for while the page is loading but the mutation has finished successfully
                data?.authenticate?.__typename === successTypename
              }
              type="submit"
            >
              Sign In
            </Button>
            <Button weight="none" tone="active" onClick={() => setMode('forgot password')}>
              Forgot your password?
            </Button>
          </Stack>
        )}
      </Stack>
    </SigninContainer>
  );
};
