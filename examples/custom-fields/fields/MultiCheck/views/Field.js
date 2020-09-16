/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import { FieldContainer, FieldDescription } from '@arch-ui/fields';
import { Checkbox } from './MultiCheck';
import { ShieldIcon } from '@primer/octicons-react';
import { Lozenge } from '@arch-ui/lozenge';
import { colors, gridSize } from '@arch-ui/theme';

const MultiCheckField = ({ onChange, autoFocus, field, value, errors }) => {
  const initialState = value ? value : field.config.defaultValue;
  const [values, setValues] = useState(initialState);
  useEffect(() => {
    onChange(values);
  }, [values]);

  const handleChange = newValue => {
    setValues({ ...values, ...newValue });
  };

  const accessError = (errors || []).find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );

  return (
    <FieldContainer>
      <div
        css={{
          color: colors.N60,
          fontSize: '0.9rem',
          fontWeight: 500,
          paddingBottom: gridSize,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {field.label}
      </div>
      {accessError ? (
        <ShieldIcon title={accessError.message} css={{ color: colors.N20, marginRight: '1em' }} />
      ) : null}
      {field.isRequired ? <Lozenge appearance="primary"> Required </Lozenge> : null}
      <FieldDescription text={field.adminDoc} />
      <div>
        {field.config.options.map(label => (
          <Checkbox
            key={`ks-input-${label}`}
            autoFocus={autoFocus}
            value={values[label]}
            label={label}
            onChange={handleChange}
          />
        ))}
      </div>
    </FieldContainer>
  );
};

export default MultiCheckField;
