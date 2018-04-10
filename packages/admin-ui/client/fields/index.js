/* TODO: this should probably be built with webpack? or a loader? */

import TextField from './Text/Field';
import PasswordField from './Password/Field';
import SelectField from './Select/Field';

export default {
  Text: {
    Field: TextField,
  },
  Password: {
    Field: PasswordField,
  },
  Select: {
    Field: SelectField,
  },
};
