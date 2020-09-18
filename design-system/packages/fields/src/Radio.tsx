/** @jsx jsx */

import { Fragment, InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { jsx, VisuallyHidden } from '@keystone-ui/core';

import { ControlLabel } from './components/ControlLabel';
import { DotIcon } from './components/Icons';
import { useIndicatorStyles, useIndicatorTokens } from './hooks/indicators';

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
  /** The value of the Radio. */
  value?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const RadioControl = forwardRef<HTMLInputElement, RadioControlProps>((props, ref) => (
  <Fragment>
    <VisuallyHidden ref={ref} as="input" type="radio" {...props} />
    <Indicator>
      <DotIcon />
    </Indicator>
  </Fragment>
));

const Indicator = (props: { children?: ReactNode }) => {
  const tokens = useIndicatorTokens({ type: 'radio' });
  const styles = useIndicatorStyles({ tokens });
  return <div css={styles} {...props} />;
};
