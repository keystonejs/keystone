/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component, createRef } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { FlexGroup } from '@arch-ui/layout';
import { Button } from '@arch-ui/button';
import { EyeIcon, LockIcon } from '@arch-ui/icons';
import { A11yText } from '@arch-ui/typography';

export default class PasswordField extends Component {
  focusTarget = createRef();
  state = {
    isEditing: false,
    showInputValue: false,
    inputPassword: '',
    inputConfirm: '',
  };
  onChange = ({ target }) => {
    const { name, value } = target;

    this.setState({ [name]: value }, () => {
      if (name === 'inputPassword') this.props.onChange(value);
    });
  };
  toggleInterface = () => {
    function maybeFocus() {
      if (this.state.isEditing && this.focusTarget.current) {
        this.focusTarget.current.focus();
      }
    }

    this.setState(state => ({ isEditing: !state.isEditing }), maybeFocus);
  };
  toggleMode = () => {
    this.setState(state => ({ showInputValue: !state.showInputValue }));
  };
  render() {
    const { isEditing, inputPassword, inputConfirm, showInputValue } = this.state;
    const { autoFocus, field, value: serverValue } = this.props;
    const value = serverValue || '';
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          {isEditing ? (
            <FlexGroup growIndexes={[0, 1]}>
              <Input
                autoComplete="off"
                autoFocus={autoFocus}
                id={htmlID}
                ref={this.focusTarget}
                name="inputPassword"
                onChange={this.onChange}
                placeholder="New Password"
                type={showInputValue ? 'text' : 'password'}
                value={inputPassword}
              />
              <Input
                autoComplete="off"
                autoFocus={autoFocus}
                name="inputConfirm"
                onChange={this.onChange}
                placeholder="Confirm Password"
                type={showInputValue ? 'text' : 'password'}
                value={inputConfirm}
              />
              <Button
                isActive={showInputValue}
                onClick={this.toggleMode}
                title={showInputValue ? 'Hide Text' : 'Show Text'}
                variant="ghost"
              >
                <A11yText>{showInputValue ? 'Hide Text' : 'Show Text'}</A11yText>
                <div css={{ width: 20 }}>{showInputValue ? <LockIcon /> : <EyeIcon />}</div>
              </Button>
            </FlexGroup>
          ) : (
            <Button onClick={this.toggleInterface} variant="ghost">
              {value ? 'Update Password' : 'Set Password'}
            </Button>
          )}
        </FieldInput>
      </FieldContainer>
    );
  }
}
