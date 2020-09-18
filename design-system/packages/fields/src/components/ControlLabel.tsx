/** @jsx jsx */

import { ReactNode, ReactElement } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';

/**
 * TODO
 *
 * - Separate out tokens and style function
 */

type ControlLabelProps = {
  className?: string;
  control: ReactElement;
  children?: ReactNode;
};

export const ControlLabel = ({ children, className, control }: ControlLabelProps) => {
  const { spacing, typography } = useTheme();

  return (
    <label className={className} css={{ alignItems: 'flex-start', display: 'inline-flex' }}>
      {control}
      {children && (
        <div
          css={{
            fontSize: typography.fontSize.medium,
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
