// @flow

import { type Node } from 'react';
import styled from '@emotion/styled';

import { borderRadius, colors } from '@arch-ui/theme';

const boldBackgroundColor = {
  info: colors.primary,
  success: colors.create,
  warning: colors.warning,
  danger: colors.danger,
};
const boldTextColor = {
  info: 'white',
  success: 'white',
  warning: 'white',
  danger: 'white',
};
const subtleBackgroundColor = {
  info: colors.B.L80,
  success: colors.G.L80,
  warning: colors.Y.L80,
  danger: colors.R.L80,
};
const subtleTextColor = {
  info: colors.B.D20,
  success: colors.G.D20,
  warning: colors.Y.D20,
  danger: colors.R.D20,
};

type Props = {
  /* Affects the visual style of the alert */
  appearance: 'info' | 'success' | 'danger' | 'warning',
  /* The alert content */
  children: Node,
  /* The value displayed within the alert. */
  variant: 'bold' | 'subtle',
};

export const Alert = styled.div(({ appearance, variant }: Props) => ({
  backgroundColor:
    variant === 'bold' ? boldBackgroundColor[appearance] : subtleBackgroundColor[appearance],
  color: variant === 'bold' ? boldTextColor[appearance] : subtleTextColor[appearance],
  borderRadius,
  display: 'flex',
  fontWeight: variant === 'bold' ? 500 : null,
  minWidth: 1,
  padding: '0.9em 1.2em',

  '& a': {
    color: variant === 'bold' ? boldTextColor[appearance] : subtleTextColor[appearance],
    textDecoration: 'underline',
  },
}));

Alert.defaultProps = {
  appearance: 'info',
  variant: 'subtle',
};
