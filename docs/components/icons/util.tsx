/** @jsx jsx */
import { jsx } from '@emotion/react';
import { SVGAttributes } from 'react';

export type IconGradient = 'grad1' | 'grad2' | 'grad3' | 'grad4' | 'logo';
export type IconProps = { grad?: IconGradient | null } & SVGAttributes<SVGElement>;

export function Gradients({ name }: { name: string }) {
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
      <linearGradient id={`${name}-logo`} x1="0%" x2="50%" y1="0%" y2="71.9%">
        <stop offset="0%" stopColor="var(--grad1-2)" />
        <stop offset="100%" stopColor="var(--grad1-1)" />
      </linearGradient>
    </defs>
  );
}
