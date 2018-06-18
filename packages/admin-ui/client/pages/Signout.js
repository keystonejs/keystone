import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import styled from 'react-emotion';

import SessionProvider from '../providers/Session';
import logo from '../assets/logo.png';

const Container = styled.div({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
});

const Box = styled.div({
  boxShadow: '0 2px 1px #f1f1f1',
  backgroundColor: 'white',
  border: '1px solid #e9e9e9',
  borderRadius: '0.3em',
  margin: '200px auto',
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

class SignedOut extends Component {
  render() {
    const { signinPath, signoutPath, sessionPath } = this.props;
    return (
      <Container>
        <SessionProvider
          autoSignout
          signinPath={signinPath}
          signoutPath={signoutPath}
          sessionPath={sessionPath}
        >
          {({ isLoading }) => (
            <Box>
              <img src={logo} width="205" height="68" alt="KeystoneJS Logo" />
              <Divider />
              <Content>
                {isLoading ? (
                  'Loading...'
                ) : (
                  <Fragment>
                    <p>You have been signed out.</p>
                    <p>
                      <Link to={signinPath}>Sign In</Link>
                    </p>
                  </Fragment>
                )}
              </Content>
            </Box>
          )}
        </SessionProvider>
      </Container>
    );
  }
}

export default SignedOut;
