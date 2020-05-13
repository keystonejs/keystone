/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

const PasswordCellView = ({ item: { password_is_set } = {} }) => {
  return password_is_set ? (
    'Is set'
  ) : (
    <span css={{ color: colors.danger, fontWeight: 'bold' }}>Not set</span>
  );
};

export default PasswordCellView;
