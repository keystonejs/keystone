import React, { Component } from 'react';
import styled from 'react-emotion';

import { Input } from '@keystonejs/ui/src/primitives/forms';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { colors } from '@keystonejs/ui/src/theme';

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

const FieldLabel = styled.div({
  color: colors.N60,
  marginBottom: 8,
  fontSize: 16,
});

const Fields = styled.div({
  marginBottom: 8,
  width: 280,
});

class Session extends Component {
  state = {
    username: '',
    password: '',
  };
  onUsernameChange = event => {
    this.setState({ username: event.target.value });
  };
  onPasswordChange = event => {
    this.setState({ password: event.target.value });
  };
  render() {
    const { apiPath } = this.props;
    const { username, password } = this.state;
    return (
      <Container>
        <SessionProvider apiPath={apiPath}>
          {({ user, signIn, signOut, isLoading }) => (
            <Box>
              <img src={logo} width="205" height="68" alt="KeystoneJS Logo" />
              <Divider />
              <div>
                <Fields>
                  <FieldLabel>Email</FieldLabel>
                  <Input onChange={this.onUsernameChange} value={username} />
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    onChange={this.onPasswordChange}
                    value={password}
                  />
                </Fields>
                <Button
                  appearance="primary"
                  onClick={() => signIn({ username, password })}
                  style={{ marginRight: 16 }}
                >
                  Sign In
                </Button>
                <Button variant="subtle" appearance="danger" onClick={signOut}>
                  Sign Out
                </Button>
                <div
                  style={{
                    marginTop: 16,
                  }}
                >
                  {isLoading
                    ? 'loading...'
                    : user ? `Signed in as ${user.name}` : 'Signed Out'}
                </div>
              </div>
            </Box>
          )}
        </SessionProvider>
      </Container>
    );
  }
}

export default Session;
