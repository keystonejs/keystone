/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import classnames from 'classnames';
import { HTMLAttributes } from 'react';

type AlertProps = {
  look?: 'neutral' | 'tip' | 'warn' | 'error';
} & HTMLAttributes<HTMLElement>;

export function Alert({ look = 'neutral', className, ...props }: AlertProps) {
  const classes = classnames('hint', look, className); // styles for this component can be found in the _app.js file
  return <p className={classes} {...props} />;
}
