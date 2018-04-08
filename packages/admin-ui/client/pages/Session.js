import React, { Component } from 'react';
import styled from 'react-emotion';

import { Input, PrimaryButton } from '../primitives/forms';

import logo from '../assets/logo.png';

const Container = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Box = styled('div')`
  box-shadow: 0 2px 1px #f1f1f1;
  background-color: white;
  border: 1px solid #e9e9e9;
  border-radius: 0.3em;
  margin: 200px auto;
  padding: 40px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
`;

const Divider = styled('div')`
  border-right: 1px solid #eee;
  min-height: 185px;
  line-height: 185px;
  margin: 0 40px;
`;

const FieldLabel = styled('div')`
  color: #7f7f7f;
  margin-bottom: 8px;
  font-size: 16px;
`;

const Fields = styled('div')`
  margin-bottom: 8px;
  width: 280px;
`;

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
            <PrimaryButton to="/admin">Sign In</PrimaryButton>
          </div>
        </Box>
      </Container>
    );
  }
}

export default Session;
