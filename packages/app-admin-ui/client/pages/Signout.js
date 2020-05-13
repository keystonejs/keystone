/** @jsx jsx */

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { Fragment } from 'react';

import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { CheckIcon } from '@arch-ui/icons';
import { Button } from '@arch-ui/button';
import { LoadingIndicator } from '@arch-ui/loading';
import { colors } from '@arch-ui/theme';

import Animation from '../components/Animation';
import { useAdminMeta } from '../providers/AdminMeta';

const FlexBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Container = styled(FlexBox)`
  min-height: 100vh;
`;

const Caption = styled.p`
  font-size: 1.5em;
`;

const SignOutPageButton = styled(Button)`
  width: 200px;
  height: 2.6em;
  margin-bottom: 0.8em;
  line-height: unset;
`;

const SignedOutPage = () => {
  const {
    authStrategy: {
      gqlNames: { unauthenticateMutationName },
    },
    signinPath,
  } = useAdminMeta();

  const UNAUTH_MUTATION = gql`
    mutation {
      unauthenticate: ${unauthenticateMutationName} {
        success
      }
    }
  `;

  const [signOut, { loading, client, called }] = useMutation(UNAUTH_MUTATION, {
    onCompleted: () => {
      // Ensure there's no old authenticated data hanging around
      client.resetStore();
    },
  });

  if (!called) {
    signOut();
  }

  return (
    <Container>
      {loading ? (
        <Fragment>
          <LoadingIndicator css={{ height: '3em' }} size={12} />
          <Caption>Signing out.</Caption>
        </Fragment>
      ) : (
        <Fragment>
          <Animation name="pulse" duration="500ms">
            <CheckIcon css={{ color: colors.primary, height: '3em', width: '3em' }} />
          </Animation>
          <Caption>You have been signed out.</Caption>
          <FlexBox>
            <SignOutPageButton variant="ghost" href={signinPath}>
              Sign In
            </SignOutPageButton>
          </FlexBox>
        </Fragment>
      )}
    </Container>
  );
};

export default SignedOutPage;
