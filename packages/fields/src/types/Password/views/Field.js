/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useState, useRef, useEffect } from 'react';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Alert } from '@arch-ui/alert';
import { Input } from '@arch-ui/input';
import { FlexGroup } from '@arch-ui/layout';
import { Button } from '@arch-ui/button';
import { EyeIcon, LockIcon } from '@arch-ui/icons';
import { A11yText } from '@arch-ui/typography';

const PasswordField = ({ onChange, autoFocus, field, value: serverValue, errors, warnings }) => {
  const focusTarget = useRef();

  const [isEditing, setIsEditing] = useState(false);
  const [showInputValue, setShowInputValue] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [inputConfirm, setInputConfirm] = useState('');

  useEffect(() => {
    if (isEditing) {
      onChange({
        inputPassword,
        inputConfirm,
      });
    }
  }, [inputPassword, inputConfirm]);

  useEffect(() => {
    if (isEditing && focusTarget.current) {
      focusTarget.current.focus();
    }
  }, [isEditing]);

  const toggleInterface = () => {
    setIsEditing(!isEditing);
  };

  const toggleMode = () => {
    setShowInputValue(!showInputValue);
  };

  const renderErrors = src => {
    const appearance = src === errors ? 'danger' : 'warning';

    return src.map(({ message, data }) => (
      <Alert appearance={appearance} key={message}>
        {message}
        {data ? ` - ${JSON.stringify(data)}` : null}
      </Alert>
    ));
  };

  const value = serverValue || '';
  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      {field.config.adminDoc && <FieldDescription>{field.config.adminDoc}</FieldDescription>}
      <FieldInput>
        {isEditing ? (
          <FlexGroup growIndexes={[0, 1]}>
            <Input
              autoComplete="off"
              autoFocus={autoFocus}
              id={htmlID}
              ref={focusTarget}
              name="inputPassword"
              onChange={e => setInputPassword(e.target.value)}
              placeholder="New Password"
              type={showInputValue ? 'text' : 'password'}
              value={inputPassword}
            />
            <Input
              autoComplete="off"
              autoFocus={autoFocus}
              id={`${htmlID}-confirm`}
              name="inputConfirm"
              onChange={e => setInputConfirm(e.target.value)}
              placeholder="Confirm Password"
              type={showInputValue ? 'text' : 'password'}
              value={inputConfirm}
            />
            <Button
              isActive={showInputValue}
              onClick={toggleMode}
              title={showInputValue ? 'Hide Text' : 'Show Text'}
              variant="ghost"
            >
              <A11yText>{showInputValue ? 'Hide Text' : 'Show Text'}</A11yText>
              <div css={{ width: 20 }}>{showInputValue ? <LockIcon /> : <EyeIcon />}</div>
            </Button>
          </FlexGroup>
        ) : (
          <Button id={`${htmlID}-button`} onClick={toggleInterface} variant="ghost">
            {value ? 'Update Password' : 'Set Password'}
          </Button>
        )}
      </FieldInput>

      {renderErrors(errors)}
      {renderErrors(warnings)}
    </FieldContainer>
  );
};

export default PasswordField;
