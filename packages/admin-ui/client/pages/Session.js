import React, { Component } from 'react';
import styled from 'react-emotion';

import { Input } from '@keystonejs/ui/src/primitives/forms';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { colors } from '@keystonejs/ui/src/theme';

import logo from '../assets/logo.png';

function getJSON(url) {
  return fetch(url, {
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json());
}

function postJSON(url, data) {
  return fetch(url, {
    body: JSON.stringify(data),
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json());
}

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
    session: {},
  };
  componentDidMount() {
    this.getSession();
  }
  getSession = () => {
    const { apiPath } = this.props;
    getJSON(`${apiPath}/session`).then(data => {
      this.setState({ session: data });
    });
  };
  doSignIn = () => {
    const { apiPath } = this.props;
    const { username, password } = this.state;
    postJSON(`${apiPath}/signin`, { username, password })
      .then(() => this.getSession())
      .catch(error => console.error(error));
  };
  onUsernameChange = event => {
    this.setState({ username: event.target.value });
  };
  onPasswordChange = event => {
    this.setState({ password: event.target.value });
  };
  render() {
    const { username, password, session } = this.state;
    return (
      <Container>
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
            <Button appearance="primary" onClick={this.doSignIn}>
              Sign In
            </Button>
            <div>{JSON.stringify(session)}</div>
          </div>
        </Box>
      </Container>
    );
  }
}

export default Session;
