import React, { Fragment } from 'react';
import styled from '@emotion/styled';

import SessionProvider from '../providers/Session';
import logo from '../assets/logo.png';

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

const SignedOutPage = ({ isLoading, isSignedIn, signinPath, signOut }) => {
  let showLoading = isLoading;
  // If the user is still signed in, sign them out
  if (isSignedIn) {
    showLoading = true; // Pretend we're still loading
    setTimeout(signOut, 1); // Will cause a re-render, so wait a moment
  }
  return (
    <Container>
      <Alerts />
      <Box>
        <img src={logo} width="205" height="68" alt="KeystoneJS Logo" />
        <Divider />
        <Content>
          {showLoading ? (
            'Loading...'
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

export default ({ signinPath, signoutPath }) => (
  <SessionProvider signinPath={signinPath} signoutPath={signoutPath}>
    {props => <SignedOutPage signinPath={signinPath} {...props} />}
  </SessionProvider>
);
