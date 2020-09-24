/** @jsx jsx */

import { Fragment, InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { jsx, VisuallyHidden } from '@keystone-ui/core';

import { ControlLabel } from './components/ControlLabel';
import { CheckIcon } from './components/Icons';
import { useIndicatorStyles, useIndicatorTokens } from './hooks/indicators';

type CheckboxProps = {
  /** The checkbox label content. */
  children: ReactNode;
} & CheckboxControlProps;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ControlLabel className={className} control={<CheckboxControl ref={ref} {...props} />}>
        {children}
      </ControlLabel>
    );
  }
);

type CheckboxControlProps = {
  /** When true, the checkbox will be checked. */
  checked?: boolean;
  /** When true, the checkbox will be disabled. */
  disabled?: boolean;
  /** The value of the Checkbox. */
  value?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const CheckboxControl = forwardRef<HTMLInputElement, CheckboxControlProps>((props, ref) => (
  <Fragment>
    <VisuallyHidden ref={ref} as="input" type="checkbox" {...props} />
    <Indicator>
      <CheckIcon />
    </Indicator>
  </Fragment>
));

const Indicator = (props: { children?: ReactNode }) => {
  const tokens = useIndicatorTokens({ type: 'checkbox' });
  const styles = useIndicatorStyles({ tokens });
  return <div css={styles} {...props} />;
};
