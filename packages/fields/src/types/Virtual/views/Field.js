/** @jsx jsx */

import { jsx } from '@emotion/core';

import { colors, gridSize } from '@arch-ui/theme';
import { ShieldIcon } from '@primer/octicons-react';

import { FieldContainer, FieldDescription } from '@arch-ui/fields';
import PrettyData from '../prettyData';

export const FieldLabel = props => {
  const accessError = (props.errors || []).find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );
  return (
    <span
      css={{
        color: colors.N60,
        fontSize: '0.9rem',
        fontWeight: 500,
        paddingBottom: gridSize,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
      htmlFor={props.htmlFor}
    >
      {props.field.label}
      {accessError ? (
        <ShieldIcon title={accessError.message} css={{ color: colors.N20, marginRight: '1em' }} />
      ) : null}
    </span>
  );
};

const VirtualField = ({ field, errors, value: serverValue }) => {
  const value = typeof serverValue !== 'undefined' ? serverValue : '';
  const canRead = errors.every(
    error => !(error instanceof Error && error.name === 'AccessDeniedError')
  );

  return (
    <FieldContainer>
      <FieldLabel field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <PrettyData data={canRead ? value : undefined} />
    </FieldContainer>
  );
};

export default VirtualField;
