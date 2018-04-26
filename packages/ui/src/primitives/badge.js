// @flow

import React, { PureComponent } from 'react';
import styled from 'react-emotion';

import { colors } from '../theme';

const boldBackgroundColor = {
  default: colors.N60,
  primary: colors.primary,
  created: colors.create,
  important: colors.danger,
  removed: colors.danger,
};
const boldTextColor = {
  default: 'white',
  primary: 'white',
  created: 'white',
  important: 'white',
  removed: 'white',
};
const subtleBackgroundColor = {
  default: colors.N10,
  primary: colors.B.L85,
  created: colors.G.L85,
  important: colors.R.L85,
  removed: colors.R.L85,
};
const subtleTextColor = {
  default: colors.N70,
  primary: colors.B.D20,
  created: colors.G.D20,
  important: colors.R.D20,
  removed: colors.R.D20,
};

const BadgeElement = styled.div(({ appearance, variant }) => ({
  backgroundColor:
    variant === 'bold'
      ? boldBackgroundColor[appearance]
      : subtleBackgroundColor[appearance],
  borderRadius: '2em',
  color:
    variant === 'bold'
      ? boldTextColor[appearance]
      : subtleTextColor[appearance],
  display: 'inline-block',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1,
  minWidth: 1,
  padding: '0.25em 0.5em',
  textAlign: 'center',
}));

type Props = {
  /* Affects the visual style of the badge */
  appearance: 'default' | 'primary' | 'created' | 'removed',
  /* The maximum value to display e.g. value = 100, max = 50; "50+" will be displayed */
  max: number,
  /* The value displayed within the badge. */
  value: number,
  /* The value displayed within the badge. */
  variant: 'bold' | 'subtle',
};

export class Badge extends PureComponent<Props> {
  static defaultProps = {
    appearance: 'default',
    max: 99,
    value: 0,
    variant: 'subtle',
  };
  getValue = ({ value, max }: { value: number, max: number }) => {
    if (value < 0) return '0';
    if (max > 0 && value > max) return `${max}+`;
    return value;
  };
  render() {
    const { appearance, max, value, variant } = this.props;

    return (
      <BadgeElement appearance={appearance} variant={variant}>
        {this.getValue({ value, max })}
      </BadgeElement>
    );
  }
}
