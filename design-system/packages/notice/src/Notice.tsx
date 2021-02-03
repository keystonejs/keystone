/** @jsx jsx */

import { ReactNode, useMemo } from 'react';
import { jsx, makeId, useId, Stack } from '@keystone-ui/core';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { AlertCircleIcon } from '@keystone-ui/icons/icons/AlertCircleIcon';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { HelpCircleIcon } from '@keystone-ui/icons/icons/HelpCircleIcon';

import { useNoticeStyles, useNoticeTokens, ToneKey } from './hooks/notice';
import { useButtonTokens } from './hooks/button';
import { Button, ButtonProvider } from '@keystone-ui/button';

const symbols: { [key in ToneKey]: ReactNode } = {
  active: <InfoIcon />,
  passive: <AlertCircleIcon />,
  positive: <CheckCircleIcon />,
  warning: <AlertTriangleIcon />,
  negative: <AlertOctagonIcon />,
  help: <HelpCircleIcon />,
};

type Action = {
  onPress: () => void;
  label: string;
};
type NoticeProps = {
  actions?: {
    primary: Action;
    secondary?: Action;
  };
  children: ReactNode;
  tone?: ToneKey;
  title?: string;
  className?: string;
} /* TODO: & MarginProps */;

export const Notice = ({
  actions,
  children,
  tone = 'passive',
  title,
  ...otherProps
}: NoticeProps) => {
  const id = useId();
  const titleId = makeId('notice-title', id);
  const contentId = makeId('notice-content', id);
  const tokens = useNoticeTokens({ tone });
  const styles = useNoticeStyles({
    tokens,
  });

  const buttonContext = useMemo(
    () => ({ hooks: { useButtonTokens }, defaults: { tone, size: 'small' } } as const),
    [tone]
  );

  return (
    <ButtonProvider {...buttonContext}>
      <div
        css={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          outline: 0,
          ...styles.box,
        }}
        tabIndex={0}
        role="alert"
        aria-live="polite"
        aria-labelledby={titleId}
        aria-describedby={contentId}
        {...otherProps}
      >
        <div css={styles.symbol}>{symbols[tone]}</div>

        {/* margin-top declarations resolve vertical centering quirks */}
        <div css={{ flex: 1 }}>
          {title && (
            <div id={titleId} css={{ marginTop: 1, ...styles.title }}>
              {title}
            </div>
          )}

          <div id={contentId} css={{ marginTop: 2 }}>
            {children}
          </div>

          {actions && (
            <Stack across gap="small" css={styles.actions}>
              {actions.primary && <Button weight="bold">{actions.primary.label}</Button>}
              {actions.secondary && <Button weight="light">{actions.secondary.label}</Button>}
            </Stack>
          )}
        </div>
      </div>
    </ButtonProvider>
  );
};
