/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Stars from './Stars';

const StarsField = ({ field, value, errors, onChange }) => (
  <FieldContainer>
    <FieldLabel htmlFor={`ks-input-${field.path}`} field={field} errors={errors} />
    <FieldInput>
      <Stars count={field.config.starCount} value={value} onChange={onChange} />
    </FieldInput>
  </FieldContainer>
);
export default StarsField;
