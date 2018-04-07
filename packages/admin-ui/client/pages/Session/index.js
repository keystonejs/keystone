import React, { Component } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

// import { borderRadius } from '../../primitives/theme';
// import { H1 } from '../../primitives/typography';
import logo from '../../assets/logo.png';

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

const Logo = styled('img')`
  ${'' /* margin: 0 30px; */};
`;

const Form = styled('div')`
  ${'' /* margin: 0 30px; */};
`;

const FieldLabel = styled('div')`
  color: #7f7f7f;
  margin-bottom: 8px;
  font-size: 16px;
`;

const Input = styled('input')`
  background-color: white;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 0.3rem;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  color: inherit;
  font-size: 14px;
  padding: 8px;
  margin-bottom: 16px;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  width: 100%;

  &:hover {
    border-color: #bbb;
    outline: 0;
  }
  &:focus {
    border-color: #1385e5;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 0 3px rgba(19, 133, 229, 0.1);
    outline: 0;
  }
`;

const Button = styled(Link)`
  background: linear-gradient(to bottom, #1f8be6 0%, #1178ce 100%) #1385e5;
  border-width: 1px;
  border-style: solid;
  border-color: #1178ce #0f6ab7 #0e64ac;
  border-radius: 0.3rem;
  cursor: pointer;
  display: inline-block;
  font-size: 16px;
  font-weight: 400;
  padding: 8px 16px;
  outline: 0;
  touch-action: manipulation;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: white;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
`;

class Session extends Component {
  render() {
    return (
      <Container>
        <Box>
          <Logo src={logo} width="205" height="68" alt="KeystoneJS Logo" />
          <Divider />
          <Form>
            <FieldLabel>Email</FieldLabel>
            <Input />
            <FieldLabel>Password</FieldLabel>
            <Input />
            <Button to="/admin">Sign In</Button>
          </Form>
        </Box>
      </Container>
    );
  }
}

export default Session;
