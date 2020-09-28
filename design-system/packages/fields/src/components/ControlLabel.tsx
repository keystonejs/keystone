/** @jsx jsx */

import { ReactNode, ReactElement } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';

import type { SizeType } from '../types';

/**
 * TODO
 *
 * - Separate out tokens and style function
 */

type ControlLabelProps = {
  className?: string;
  control: ReactElement;
  children?: ReactNode;
  size?: SizeType;
};

export const ControlLabel = ({
  children,
  className,
  control,
  size: sizeKey = 'medium',
}: ControlLabelProps) => {
  const { controlSizes, spacing, typography } = useTheme();

  const size = controlSizes[sizeKey];

  return (
    <label className={className} css={{ alignItems: 'flex-start', display: 'inline-flex' }}>
      {control}
      {children && (
        <div
          css={{
            fontSize: size.fontSize,
            lineHeight: typography.leading.tight,
            marginLeft: spacing.small,
            paddingTop: spacing.xsmall,
            userSelect: 'none',
          }}
        >
          {children}
        </div>
      )}
    </label>
  );
};
