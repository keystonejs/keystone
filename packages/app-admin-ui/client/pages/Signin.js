import React, { useState } from 'react';
import styled from '@emotion/styled';

import { Alert } from '@arch-ui/alert';
import { Input } from '@arch-ui/input';
import { LoadingButton } from '@arch-ui/button';
import { colors } from '@arch-ui/theme';
import { PageTitle } from '@arch-ui/typography';

import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { upcase } from '@keystonejs/utils';

import KeystoneLogo from '../components/KeystoneLogo';

import { useAdminMeta } from '../providers/AdminMeta';
import { useUIHooks } from '../providers/Hooks';

const Container = styled.div({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100%',
});

const Alerts = styled.div({
  margin: '20px auto',
  width: 650,
  height: 48,
});

const Form = styled.form({
  boxShadow: '0 2px 1px #f1f1f1',
  backgroundColor: 'white',
  border: '1px solid #e9e9e9',
  borderRadius: '0.3em',
  margin: '0 auto',
  minWidth: 650,
  padding: 40,
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'center',
  alignItems: 'center',
});

const Divider = styled.div({
  borderRight: '1px solid #eee',
  minHeight: 185,
  lineHeight: 185,
  margin: '0 40px',
});

const FieldLabel = styled.div({
  color: colors.N60,
  marginTop: 16,
  marginBottom: 8,
  fontSize: 16,
});

const Fields = styled.div({
  marginBottom: 16,
  width: 280,
});

const Spacer = styled.div({
  height: 120,
});

const SignInPage = () => {
  const {
    name: siteName,
    authStrategy: { listKey, identityField, secretField },
  } = useAdminMeta();

  const { logo: getCustomLogo } = useUIHooks();

  const [identity, setIdentity] = useState('');
  const [secret, setSecret] = useState('');
  const [reloading, setReloading] = useState(false);

  const AUTH_MUTATION = gql`
    mutation signin($identity: String, $secret: String) {
      authenticate: authenticate${listKey}WithPassword(${identityField}: $identity, ${secretField}: $secret) {
        item {
          id
        }
      }
    }
  `;

  const [signIn, { error, loading, client }] = useMutation(AUTH_MUTATION, {
    variables: { identity, secret },
    onCompleted: ({ error }) => {
      if (error) {
        throw error;
      }

      // Ensure there's no old unauthenticated data hanging around
      client.resetStore();

      // Flag so the "Submit" button doesn't temporarily flash as available while reloading the page.
      setReloading(true);

      // Let the server-side redirects kick in to send the user to the right place
      window.location.reload(true);
    },
    onError: console.error,
  });

  const onSubmit = e => {
    e.preventDefault();

    if (!loading) {
      signIn();
    }
  };

  return (
    <Container>
      <Alerts>
        {error ? (
          <Alert appearance="danger">Your username and password were incorrect</Alert>
        ) : null}
      </Alerts>
      <PageTitle>{siteName}</PageTitle>
      <Form method="post" onSubmit={onSubmit}>
        {getCustomLogo ? getCustomLogo() : <KeystoneLogo />}
        <Divider />
        <div>
          <Fields>
            <FieldLabel>{upcase(identityField)}</FieldLabel>
            <Input
              name="identity"
              autoComplete="username"
              autoFocus
              value={identity}
              onChange={e => setIdentity(e.target.value)}
            />
            <FieldLabel>{upcase(secretField)}</FieldLabel>
            <Input
              type="password"
              name="secret"
              autoComplete="current-password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
            />
          </Fields>
          <LoadingButton
            appearance="primary"
            type="submit"
            isLoading={loading || reloading}
            indicatorVariant="dots"
            style={{
              width: '280px',
              height: '2.6em',
              margin: '1em 0',
            }}
          >
            Sign In
          </LoadingButton>
        </div>
      </Form>
      <Spacer />
    </Container>
  );
};

export default SignInPage;
