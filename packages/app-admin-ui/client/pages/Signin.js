import React, { Component } from 'react';
import styled from '@emotion/styled';

import { Alert } from '@arch-ui/alert';
import { Input } from '@arch-ui/input';
import { LoadingButton } from '@arch-ui/button';
import { colors } from '@arch-ui/theme';

import SessionProvider from '../providers/Session';

import logo from '../assets/logo.png';

const upcase = str => str.substr(0, 1).toUpperCase() + str.substr(1);

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

class SigninPage extends Component {
  state = {
    identity: '',
    secret: '',
    reloading: false,
  };
  onSubmit = e => {
    e.preventDefault();
    const { isLoading, signIn } = this.props;
    const { identity, secret } = this.state;
    if (isLoading) return;
    signIn({ identity, secret }).then(() => {
      // Flag so the "Submit" button doesn't temporarily flash as available
      // while reloading the page.
      this.setState(() => ({ reloading: true }));
      // Let the server-side redirects kick in to send the user to the right
      // place
      window.location.reload(true);
    });
  };
  render() {
    const { error, isLoading, authStrategy } = this.props;
    const { identity, secret } = this.state;
    return (
      <Container>
        <Alerts>
          {error ? (
            <Alert appearance="danger">Your username and password were incorrect</Alert>
          ) : null}
        </Alerts>
        <Form method="post" onSubmit={this.onSubmit}>
          <img src={logo} width="205" height="68" alt="KeystoneJS Logo" />
          <Divider />
          <div>
            <Fields>
              <FieldLabel>{upcase(authStrategy.identityField)}</FieldLabel>
              <Input
                name="identity"
                autoFocus
                value={identity}
                onChange={e => this.setState({ identity: e.target.value })}
              />
              <FieldLabel>{upcase(authStrategy.secretField)}</FieldLabel>
              <Input
                type="password"
                name="secret"
                value={secret}
                onChange={e => this.setState({ secret: e.target.value })}
              />
            </Fields>
            <LoadingButton
              appearance="primary"
              type="submit"
              isLoading={isLoading || this.state.reloading}
              indicatorVariant="dots"
            >
              Sign In
            </LoadingButton>
          </div>
        </Form>
        <Spacer />
      </Container>
    );
  }
}

export default ({ signinPath, signoutPath, authStrategy }) => (
  <SessionProvider signinPath={signinPath} signoutPath={signoutPath}>
    {props => <SigninPage {...props} authStrategy={authStrategy} />}
  </SessionProvider>
);
