/** @jsx jsx */

import { useState } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { Alert } from '@arch-ui/alert';
import { LoadingButton } from '@arch-ui/button';
import { Input } from '@arch-ui/input';
import { colors, gridSize } from '@arch-ui/theme';
import { PageTitle, Title } from '@arch-ui/typography';

import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { upcase } from '@keystonejs/utils';

import KeystoneLogo from '../components/KeystoneLogo';

import { useAdminMeta } from '../providers/AdminMeta';
import { useUIHooks } from '../providers/Hooks';

const _PADDING = gridSize * 2;
const _BUTTON_WIDTH = 280;

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
`;

const Alerts = styled.div`
  height: 48px;
`;

const Form = styled.form`
  margin-bottom: 120px;
  min-width: 650px;
  padding: 40px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
`;

const Divider = styled.div`
  border-right: 2px solid ${colors.N10};
  min-height: 450px;
  line-height: 450px;
  margin-right: 40px;
  margin-left: 60px;
`;

const FieldLabel = styled.div`
  color: ${colors.N60};
  margin-top: ${_PADDING}px;
  margin-bottom: ${gridSize}px;
  font-size: ${_PADDING}px;
`;

const Fields = styled.div`
  margin: ${_PADDING}px 0;
  width: ${_BUTTON_WIDTH}px;
`;

const SignInPage = () => {
  const {
    name: siteName,
    authStrategy: {
      gqlNames: { authenticateMutationName },
      identityField,
      secretField,
    },
  } = useAdminMeta();

  const { logo: getCustomLogo } = useUIHooks();

  const [identity, setIdentity] = useState('');
  const [secret, setSecret] = useState('');
  const [reloading, setReloading] = useState(false);

  const AUTH_MUTATION = gql`
    mutation signin($identity: String, $secret: String) {
      authenticate: ${authenticateMutationName}(${identityField}: $identity, ${secretField}: $secret) {
        item {
          id
        }
      }
    }
  `;

  const [signIn, { error, loading, client }] = useMutation(AUTH_MUTATION, {
    variables: { identity, secret },
    onCompleted: () => {
      // Ensure there's no old unauthenticated data hanging around
      client.resetStore();

      // Flag so the "Submit" button doesn't temporarily flash as available while reloading the page.
      setReloading(true);

      // Let the server-side redirects kick in to send the user to the right place
      window.location.reload(true);
    },
    onError: () => {}, // Remove once a bad password no longer throws an error
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
        {error && <Alert appearance="danger">Your username or password were incorrect</Alert>}
      </Alerts>
      <Form method="post" onSubmit={onSubmit}>
        {getCustomLogo ? getCustomLogo() : <KeystoneLogo />}
        <Divider />
        <div>
          <PageTitle css={{ marginTop: 0, marginBottom: `${gridSize}px` }}>{siteName}</PageTitle>
          <Title css={{ marginBottom: `${_PADDING * 2}px` }}>Admin UI</Title>
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
            css={{
              width: `${_BUTTON_WIDTH}px`,
              height: '2.6em',
              margin: `${_PADDING}px 0`,
            }}
          >
            Sign In
          </LoadingButton>
        </div>
      </Form>
    </Container>
  );
};

export default SignInPage;
