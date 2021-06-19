/** @jsx jsx */
import { jsx } from '@emotion/react';
import { HTMLAttributes } from 'react';

type AlertProps = {
  look: 'neutral' | 'tip' | 'warn' | 'error';
} & HTMLAttributes<HTMLElement>;

export function Alert({ look = 'neutral', className, ...props }: AlertProps) {
  return <p className={`hint ${look} ${className}`} {...props} />;
}
