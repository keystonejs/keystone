/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '../../theme';

export default function Separator({
  color = colors.greyDark,
  width = 50,
  align = 'left',
  ...props
}) {
  return (
    <hr
      css={{
        border: 'none',
        height: 6,
        width: width,
        marginLeft: align === 'left' ? 0 : 'auto',
        marginRight: align === 'right' ? 0 : 'auto',
        backgroundColor: color,
      }}
      {...props}
    />
  );
}
