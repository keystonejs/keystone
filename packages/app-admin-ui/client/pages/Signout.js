import React, { Fragment } from 'react';
import styled from '@emotion/styled';

import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import KeystoneLogo from '../components/KeystoneLogo';

import { LoadingIndicator } from '@arch-ui/loading';

const Container = styled.div({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100vh',
});

const Alerts = styled.div({
  margin: '20px auto',
  width: 650,
  height: 48,
});

const Box = styled.div({
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

const Content = styled.div({
  marginTop: 16,
  minWidth: 280,
});

const Spacer = styled.div({
  height: 120,
});

const SignedOutPage = ({ authStrategy: { listKey }, signinPath }) => {
  const UNAUTH_MUTATION = gql`
    mutation {
      unauthenticate: unauthenticate${listKey} {
        success
      }
    }
  `;

  const [signOut, { loading, client, called }] = useMutation(UNAUTH_MUTATION, {
    onCompleted: ({ error }) => {
      if (error) {
        throw error;
      }

      // Ensure there's no old authenticated data hanging around
      client.resetStore();
    },
    onError: console.error,
  });

  if (!called) {
    signOut();
  }

  return (
    <Container>
      <Alerts />
      <Box>
        <KeystoneLogo />
        <Divider />
        <Content>
          {loading ? (
            <LoadingIndicator />
          ) : (
            <Fragment>
              <p>You have been signed out.</p>
              <p>
                <a href={signinPath}>Sign In</a>
              </p>
            </Fragment>
          )}
        </Content>
      </Box>
      <Spacer />
    </Container>
  );
};

export default SignedOutPage;
