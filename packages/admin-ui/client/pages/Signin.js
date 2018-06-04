import React, { Component } from 'react';
import styled from 'react-emotion';
import qs from 'qs';
import xss from 'xss';

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

const Form = styled.form({
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

function extractAndCleanRedirectUrl() {
  const redirectToParam = qs.parse(window.location.search.slice(1)).redirectTo;
  if (typeof redirectToParam !== 'string') {
    return null;
  }

  const decodedRedirectTo = decodeuricomponent(redirectToParam);

  if (!decodedRedirectTo) {
    return null;
  }

  // Reconstruct the URL without the host
  // We do this to prevent phishing
  const urlParts = new Url(decodedRedirectTo);
  return `${urlParts.pathname}${urlParts.search}${urlParts.hash}`;
}

class Session extends Component {
  render() {
    const { adminPath, signinUrl, signoutUrl, sessionUrl } = this.props;
    const redirectTo = extractAndCleanRedirectUrl() || adminPath;
    return (
      <Container>
        <SessionProvider {...{ signinUrl, signoutUrl, sessionUrl }}>
          {({ user, signOut, isLoading }) => (
            <Form method="post" action={signinUrl}>
              <img src={logo} width="205" height="68" alt="KeystoneJS Logo" />
              <Divider />
              <div>
                <Fields>
                  <FieldLabel>Email</FieldLabel>
                  <Input name="username" />
                  <FieldLabel>Password</FieldLabel>
                  <Input type="password" name="password" />
                  <input
                    type="hidden"
                    name="redirectTo"
                    value={xss(redirectTo)}
                  />
                </Fields>
                <Button
                  appearance="primary"
                  style={{ marginRight: 16 }}
                  type="submit"
                >
                  Sign In
                </Button>
                {/* TODO: Change this to a straigh <a> tag */}
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
                    : user
                      ? `Signed in as ${user.name}`
                      : 'Signed Out'}
                </div>
              </div>
            </Form>
          )}
        </SessionProvider>
      </Container>
    );
  }
}

export default Session;
