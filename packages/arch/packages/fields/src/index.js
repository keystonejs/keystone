/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';
import { ShieldIcon } from '@primer/octicons-react';
import { Lozenge } from '@arch-ui/lozenge';

export const FieldContainer = props => (
  <div data-selector="field-container" css={{ marginBottom: gridSize * 2 }} {...props} />
);

export const FieldLabel = ({ errors = [], field, ...props }) => {
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );

  return (
    <label
      css={{
        color: colors.N60,
        fontSize: '0.9rem',
        fontWeight: 500,
        paddingBottom: gridSize,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
      {...props}
    >
      {field.label}
      <span>
        {field.isRequired && <Lozenge appearance="primary">Required</Lozenge>}
        {accessError && (
          <ShieldIcon title={accessError.message} css={{ color: colors.N20, margin: '0 1em' }} />
        )}
      </span>
    </label>
  );
};

export const FieldDescription = ({ text, ...props }) =>
  text ? (
    <p
      css={{
        margin: '0 0 8px',
        color: colors.N60,
        fontSize: '0.9rem',
      }}
      {...props}
    >
      {text}
    </p>
  ) : null;

export const FieldInput = props => (
  <div
    css={{
      display: 'flex',
    }}
    {...props}
  />
);

export const Currency = props => (
  <span
    css={{
      alignContent: 'center',
      backgroundColor: colors.N10,
      border: '1px solid transparent',
      borderBottomRightRadius: 0,
      borderColor: colors.N20,
      borderRadius: 4,
      borderRight: 0,
      borderTopRightRadius: 0,
      display: 'flex',
      fontSize: '0.9rem',
      marginRight: -2,
      padding: 10,
    }}
    {...props}
  />
);
