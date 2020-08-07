/** @jsx jsx */

import { useState } from 'react';
import { jsx } from '@emotion/core';

import { Alert } from '@arch-ui/alert';
import { LoadingButton } from '@arch-ui/button';
import { Input } from '@arch-ui/input';
import { colors, gridSize } from '@arch-ui/theme';
import { PageTitle, Title } from '@arch-ui/typography';

import { gql, useMutation } from '@apollo/client';

import { upcase } from '@keystonejs/utils';

import KeystoneLogo from '../components/KeystoneLogo';

import { useAdminMeta } from '../providers/AdminMeta';
import { useUIHooks } from '../providers/Hooks';

const _PADDING = gridSize * 2;
const _BUTTON_WIDTH = 280;

const Container = props => (
  <div
    css={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
    }}
    {...props}
  />
);

const Alerts = props => <div css={{ height: '48px' }} {...props} />;

const Form = props => (
  <form
    css={{
      marginBottom: '120px',
      minWidth: '650px',
      padding: '40px',
      display: 'flex',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    {...props}
  />
);

const Divider = props => (
  <div
    css={{
      borderRight: `2px solid ${colors.N10}`,
      minHeight: '450px',
      lineHeight: '450px',
      marginRight: '40px',
      marginLeft: '60px',
    }}
    {...props}
  />
);

const FieldLabel = props => (
  <div
    css={{
      color: `${colors.N60}`,
      marginTop: `${_PADDING}px`,
      marginBottom: `${gridSize}px`,
      fontSize: `${_PADDING}px`,
    }}
    {...props}
  />
);

const Fields = props => (
  <div css={{ margin: `${_PADDING}px 0`, width: `${_BUTTON_WIDTH}px` }} {...props} />
);

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
    onCompleted: async () => {
      // Flag so the "Submit" button doesn't temporarily flash as available while reloading the page.
      setReloading(true);

      // Ensure there's no old unauthenticated data hanging around
      await client.clearStore();

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
