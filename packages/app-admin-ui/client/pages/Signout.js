import React from 'react';
import styled from '@emotion/styled';

import SessionProvider from '../providers/Session';
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

const SignedOutPage = ({ isLoading, signinPath }) => {
  return (
    <Container>
      <Alerts />
      <Box>
        <KeystoneLogo />
        <Divider />
        <Content>
          {isLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              <p>You have been signed out.</p>
              <p>
                <a href={signinPath}>Sign In</a>
              </p>
            </>
          )}
        </Content>
      </Box>
      <Spacer />
    </Container>
  );
};

export default ({ signinPath, signoutPath }) => (
  <SessionProvider signinPath={signinPath} signoutPath={signoutPath} autoSignout>
    {props => <SignedOutPage signinPath={signinPath} {...props} />}
  </SessionProvider>
);
