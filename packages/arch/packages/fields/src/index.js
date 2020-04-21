/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';
import { ShieldIcon } from '@arch-ui/icons';
import { Lozenge } from '@arch-ui/lozenge';

export const FieldContainer = props => (
  <div data-selector="field-container" css={{ marginBottom: gridSize * 2 }} {...props} />
);

export const FieldLabel = props => {
  const accessError = (props.errors || []).find(
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
      className={props.className}
      htmlFor={props.htmlFor}
    >
      {props.field.label}{' '}
      {accessError ? (
        <ShieldIcon title={accessError.message} css={{ color: colors.N20, marginRight: '1em' }} />
      ) : null}{' '}
      {props.field.config.isRequired ? <Lozenge appearance="primary"> Required </Lozenge> : null}
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
