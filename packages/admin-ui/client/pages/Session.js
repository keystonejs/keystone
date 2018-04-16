import React, { Component } from 'react';
import styled from 'react-emotion';

import { Input } from '@keystonejs/ui/src/primitives/forms';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { colors } from '@keystonejs/ui/src/theme';

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
  render() {
    return (
      <Container>
        <Box>
          <img src={logo} width="205" height="68" alt="KeystoneJS Logo" />
          <Divider />
          <div>
            <Fields>
              <FieldLabel>Email</FieldLabel>
              <Input />
              <FieldLabel>Password</FieldLabel>
              <Input />
            </Fields>
            <Button appearance="primary" to="/admin">
              Sign In
            </Button>
          </div>
        </Box>
      </Container>
    );
  }
}

export default Session;
