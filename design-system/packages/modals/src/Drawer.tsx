/** @jsx jsx */

import { Fragment, MutableRefObject, ReactNode } from 'react';
import { Button } from '@keystone-ui/button';
import { jsx, makeId, useId, useTheme, Heading, Stack, Divider } from '@keystone-ui/core';

import { DrawerBase } from './DrawerBase';
import { useDrawerControllerContext } from './DrawerController';
import { ActionsType } from './types';

type DrawerProps = {
  actions: ActionsType;
  children: ReactNode;
  id?: string;
  initialFocusRef?: MutableRefObject<any>;
  title: string;
  width?: 'narrow' | 'wide';
};

export const Drawer = ({
  actions,
  children,
  title,
  id,
  initialFocusRef,
  width = 'narrow',
}: DrawerProps) => {
  const transitionState = useDrawerControllerContext();
  const { cancel, confirm } = actions;
  const { spacing } = useTheme();

  const safeClose = actions.confirm.loading ? () => {} : actions.cancel.action;

  const instanceId = useId(id);
  const headingId = makeId(instanceId, 'heading');

  return (
    <DrawerBase
      transitionState={transitionState}
      aria-labelledby={headingId}
      initialFocusRef={initialFocusRef}
      onSubmit={actions.confirm.action}
      onClose={safeClose}
      width={width}
    >
      <div css={{ padding: `${spacing.large}px ${spacing.xlarge}px` }}>
        <Heading id={headingId} type="h3">
          {title}
        </Heading>
      </div>

      <div css={{ overflowY: 'auto', padding: `0 ${spacing.xlarge}px` }}>{children}</div>

      {width === 'narrow' ? (
        <div
          css={{
            display: 'flex',
            flexShrink: 0,
            flexDirection: 'column',
            padding: `${spacing.large}px ${spacing.xlarge}px`,

            '> button + button': {
              marginTop: spacing.small,
            },
          }}
        >
          <Button tone="active" weight="bold" type="submit" isLoading={confirm.loading}>
            {confirm.label}
          </Button>
          <Button onClick={safeClose} disabled={confirm.loading} weight="none" tone="passive">
            {cancel.label}
          </Button>
        </div>
      ) : (
        <Fragment>
          <Divider marginX="large" marginTop="medium" />
          <Stack padding="large" across gap="small">
            <Button tone="active" weight="bold" type="submit" isLoading={confirm.loading}>
              {confirm.label}
            </Button>
            <Button onClick={safeClose} disabled={confirm.loading} weight="none" tone="passive">
              {cancel.label}
            </Button>
          </Stack>
        </Fragment>
      )}
    </DrawerBase>
  );
};
