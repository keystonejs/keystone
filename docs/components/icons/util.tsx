/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

export function Grad({ name }) {
  return (
    <defs>
      <linearGradient id={`${name}-grad1`} x1="0%" x2="50%" y1="0%" y2="71.9%">
        <stop offset="0%" stopColor="var(--grad1-1)" />
        <stop offset="100%" stopColor="var(--grad1-2)" />
      </linearGradient>
      <linearGradient id={`${name}-grad2`} x1="0%" x2="50%" y1="0%" y2="71.9%">
        <stop offset="0%" stopColor="var(--grad2-1)" />
        <stop offset="100%" stopColor="var(--grad2-2)" />
      </linearGradient>
      <linearGradient id={`${name}-grad3`} x1="0%" x2="50%" y1="0%" y2="71.9%">
        <stop offset="0%" stopColor="var(--grad3-1)" />
        <stop offset="100%" stopColor="var(--grad3-2)" />
      </linearGradient>
      <linearGradient id={`${name}-grad4`} x1="0%" x2="50%" y1="0%" y2="71.9%">
        <stop offset="0%" stopColor="var(--grad4-1)" />
        <stop offset="100%" stopColor="var(--grad4-2)" />
      </linearGradient>
    </defs>
  );
}
