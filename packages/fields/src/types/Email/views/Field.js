/** @jsx jsx */
import { jsx } from '@emotion/core';
import TextField from '../../Text/views/Field';

const EmailField = props => {
  return <TextField {...props} type="email" />;
};

export default EmailField;
