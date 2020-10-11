/** @jsx jsx */

import { Fragment, InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { jsx, VisuallyHidden } from '@keystone-ui/core';

import { ControlLabel } from './components/ControlLabel';
import { CheckIcon } from './components/Icons';
import { useIndicatorStyles, useIndicatorTokens } from './hooks/indicators';
import type { SizeType } from './types';

type CheckboxProps = {
  /** The checkbox label content. */
  children: ReactNode;
} & CheckboxControlProps;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, className, size, ...props }, ref) => {
    return (
      <ControlLabel
        className={className}
        size={size}
        control={<CheckboxControl ref={ref} size={size} {...props} />}
      >
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
  /** The size of the Checkbox */
  size?: SizeType;
  /** The value of the Checkbox. */
  value?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export const CheckboxControl = forwardRef<HTMLInputElement, CheckboxControlProps>(
  ({ className, size, ...props }, ref) => (
    <Fragment>
      <VisuallyHidden ref={ref} as="input" type="checkbox" {...props} />
      <Indicator className={className} size={size}>
        <CheckIcon size={size} />
      </Indicator>
    </Fragment>
  )
);

const Indicator = ({
  className,
  size,
  ...props
}: {
  size?: SizeType;
  children?: ReactNode;
  className?: string;
}) => {
  const tokens = useIndicatorTokens({ type: 'checkbox', size: size || 'medium' });
  const styles = useIndicatorStyles({ tokens });
  return <div className={className} css={styles} {...props} />;
};
