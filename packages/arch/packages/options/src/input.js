// @flow
// a fork of https://github.com/JedWatson/react-select/blob/ba76246a92fe9371b5d4f8795d30119b045dcaba/src/components/Input.js
// without react-input-autosize because it's causing expensive layout recalcs
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { type ElementRef } from 'react';
import type { PropsWithStyles, ClassNamesState } from '../types';

export type InputProps = PropsWithStyles & {
  cx: (?string | null, ?ClassNamesState, ?string) => string | void,
  /** Reference to the internal element */
  innerRef: (ElementRef<*>) => void,
  /** Set whether the input should be visible. Does not affect input size. */
  isHidden: boolean,
  /** Whether the input is disabled */
  isDisabled?: boolean,
  className?: string,
};

const inputStyle = isHidden => ({
  background: 0,
  border: 0,
  fontSize: 'inherit',
  opacity: isHidden ? 0 : 1,
  outline: 0,
  padding: 0,
  color: 'inherit',
});

const Input = ({
  className,
  cx,
  getStyles,
  innerRef,
  isHidden,
  isDisabled,
  theme,
  selectProps,
  ...props
}: InputProps) => (
  <div css={getStyles('input', { theme, ...props })}>
    <input
      className={cx(null, { input: true }, className)}
      ref={innerRef}
      css={inputStyle(isHidden)}
      disabled={isDisabled}
      {...props}
    />
  </div>
);

export default Input;
