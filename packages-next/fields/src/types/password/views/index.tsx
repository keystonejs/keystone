/** @jsx jsx */

import { useState } from 'react';

import { CellContainer } from '@keystone-next/admin-ui/components';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Stack, Text, VisuallyHidden, jsx, useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { EyeIcon } from '@keystone-ui/icons/icons/EyeIcon';
import { EyeOffIcon } from '@keystone-ui/icons/icons/EyeOffIcon';
import { XIcon } from '@keystone-ui/icons/icons/XIcon';
import { SegmentedControl } from '@keystone-ui/segmented-control';

export const Field = ({
  field,
  value,
  onChange,
  forceValidation,
  autoFocus,
}: FieldProps<typeof controller>) => {
  const [showInputValue, setShowInputValue] = useState(false);
  const [touchedFirstInput, setTouchedFirstInput] = useState(false);
  const [touchedSecondInput, setTouchedSecondInput] = useState(false);
  const shouldShowValidation = forceValidation || (touchedFirstInput && touchedSecondInput);
  const validation =
    shouldShowValidation && value.kind === 'editing'
      ? value.value === value.confirm
        ? value.value.length >= field.minLength
          ? undefined
          : `The password must be at least ${field.minLength} characters long`
        : 'The passwords do not match'
      : undefined;
  const inputType = showInputValue ? ('text' as const) : ('password' as const);
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {onChange === undefined ? (
        value.isSet ? (
          'Password is set'
        ) : (
          'Password is not set'
        )
      ) : value.kind === 'initial' ? (
        <Button
          autoFocus={autoFocus}
          onClick={() => {
            onChange({
              kind: 'editing',
              confirm: '',
              value: '',
              isSet: value.isSet,
            });
          }}
        >
          {value.isSet ? 'Change Password' : 'Set Password'}
        </Button>
      ) : (
        <Stack gap="small">
          <div css={{ display: 'flex' }}>
            <TextInput
              autoFocus
              invalid={validation !== undefined}
              type={inputType}
              value={value.value}
              placeholder="New Password"
              onChange={event => {
                onChange({
                  ...value,
                  value: event.target.value,
                });
              }}
              onBlur={() => {
                setTouchedFirstInput(true);
              }}
            />
            <Spacer />
            <TextInput
              invalid={validation !== undefined}
              type={inputType}
              value={value.confirm}
              placeholder="Confirm Password"
              onChange={event => {
                onChange({
                  ...value,
                  confirm: event.target.value,
                });
              }}
              onBlur={() => {
                setTouchedSecondInput(true);
              }}
            />
            <Spacer />
            <Button
              onClick={() => {
                setShowInputValue(!showInputValue);
              }}
            >
              <VisuallyHidden>{showInputValue ? 'Hide Text' : 'Show Text'}</VisuallyHidden>
              {showInputValue ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
            <Spacer />
            <Button
              onClick={() => {
                onChange({
                  kind: 'initial',
                  isSet: value.isSet,
                });
              }}
            >
              <VisuallyHidden>Cancel</VisuallyHidden>
              <XIcon />
            </Button>
          </div>
          {validation && (
            <Text color="red600" size="small">
              {validation}
            </Text>
          )}
        </Stack>
      )}
      {/* {item[`${field.path}_is_set`] === true ? 'Is set' : 'Is not set'} */}
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({ item, field }) => {
  return <CellContainer>{item[`${field.path}_is_set`] ? 'Is set' : 'Is not set'}</CellContainer>;
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[`${field.path}_is_set`] ? 'Is set' : 'Is not set'}
    </FieldContainer>
  );
};

type PasswordController = FieldController<
  | {
      kind: 'initial';
      isSet: boolean | null;
    }
  | {
      kind: 'editing';
      isSet: boolean | null;
      value: string;
      confirm: string;
    },
  boolean
> & { minLength: number };

export const controller = (
  config: FieldControllerConfig<{ minLength: number }>
): PasswordController => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path}_is_set`,
    minLength: config.fieldMeta.minLength,
    defaultValue: {
      kind: 'initial',
      isSet: null,
    },
    validate(state) {
      return (
        state.kind === 'initial' ||
        (state.value === state.confirm && state.value.length >= config.fieldMeta.minLength)
      );
    },
    deserialize: data => ({ kind: 'initial', isSet: data[`${config.path}_is_set`] }),
    serialize: value => {
      if (value.kind === 'initial') return {};
      return { [config.path]: value.value };
    },
    filter: {
      Filter(props) {
        return (
          <SegmentedControl
            selectedIndex={Number(props.value)}
            onChange={value => {
              props.onChange(!!value);
            }}
            segments={['Is Not Set', 'Is Set']}
          />
        );
      },
      graphql: ({ type, value }) => {
        return { [`${config.path}_${type}`]: value };
      },
      Label({ value }) {
        return value ? 'is set' : 'is not set';
      },
      types: {
        is_set: {
          label: 'Is Set',
          initialValue: true,
        },
      },
    },
  };
};

const Spacer = () => {
  const { spacing } = useTheme();
  return <div css={{ width: spacing.small, flexShrink: 0 }} />;
};
