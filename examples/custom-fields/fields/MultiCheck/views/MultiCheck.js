/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FieldInput } from '@arch-ui/fields';
import { CheckboxPrimitive } from '@arch-ui/controls';

export const Checkbox = ({ label, value, onChange }) => {
  const checked = value || false;
  const htmlID = `ks-input-${label}`;
  return (
    <div css={{ display: 'flex', alignItems: 'center' }}>
      <label htmlFor={htmlID}>{label}</label>
      <FieldInput css={{ height: 35, order: '-1' }}>
        <CheckboxPrimitive
          autoFocus={false}
          checked={checked}
          onChange={event => onChange({ [label]: event.target.checked })}
          id={htmlID}
        />
      </FieldInput>
    </div>
  );
};
