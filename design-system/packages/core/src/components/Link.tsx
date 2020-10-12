/** @jsx jsx */

import { jsx } from '../emotion';
import { useTheme } from '../theme';
import { forwardRefWithAs } from '../utils';

export const Link = forwardRefWithAs<
  'a',
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}
>(({ as: Tag = 'a', ...props }, ref) => {
  const { typography, colors } = useTheme();

  const styles = {
    color: colors.linkColor,
    cursor: 'pointer',
    fontWeight: typography.fontWeight.medium,
    textDecoration: 'none',

    ':hover, :focus': {
      color: colors.linkHoverColor,
      textDecoration: 'underline',
    },
  };

  return <Tag css={styles} ref={ref} {...props} />;
});
