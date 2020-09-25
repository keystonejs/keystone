/** @jsx jsx */

import { Fragment, InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { jsx, VisuallyHidden } from '@keystone-ui/core';

import { ControlLabel } from './components/ControlLabel';
import { DotIcon } from './components/Icons';
import { useIndicatorStyles, useIndicatorTokens } from './hooks/indicators';
import type { SizeType } from './types';

type RadioProps = {
  /** The radio label content. */
  children: ReactNode;
} & RadioControlProps;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ControlLabel className={className} control={<RadioControl ref={ref} {...props} />}>
        {children}
      </ControlLabel>
    );
  }
);

type RadioControlProps = {
  /** When true, the radio will be checked. */
  checked?: boolean;
  /** When true, the radio will be disabled. */
  disabled?: boolean;
  /** The size of the Radio */
  size?: SizeType;
  /** The value of the Radio. */
  value?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const RadioControl = forwardRef<HTMLInputElement, RadioControlProps>(
  ({ size, ...props }, ref) => (
    <Fragment>
      <VisuallyHidden ref={ref} as="input" type="radio" {...props} />
      <Indicator size={size}>
        <DotIcon size={size} />
      </Indicator>
    </Fragment>
  )
);

const Indicator = ({ size, ...props }: { size?: SizeType; children?: ReactNode }) => {
  const tokens = useIndicatorTokens({ type: 'radio', size: size || 'medium' });
  const styles = useIndicatorStyles({ tokens });
  return <div css={styles} {...props} />;
};
