/** @jsx jsx */

import { Button } from '@keystone-ui/button';
import { jsx, Box, Heading, useTheme, makeId, useId } from '@keystone-ui/core';
import { DialogBase } from './DialogBase';

type Action = {
  action: () => void;
  label: string;
};

type AlertDialogProps = {
  actions: {
    cancel?: Action;
    confirm: Action & { loading?: boolean };
  };
  id?: string;
  isOpen: boolean;
  children: React.ReactNode;
  title: string;
  tone?: 'negative' | 'active';
};

export const AlertDialog = ({
  actions,
  isOpen,
  children,
  title,
  id,
  tone = 'active',
}: AlertDialogProps) => {
  const { cancel, confirm } = actions;
  const theme = useTheme();
  const instanceId = useId(id);
  const headingId = makeId('heading', instanceId);

  const onClose = () => {
    if (actions.cancel) {
      actions.cancel.action();
    } else {
      actions.confirm.action();
    }
  };

  return (
    <DialogBase isOpen={isOpen} onClose={onClose} width={440} aria-labelledby={headingId}>
      <div css={{ padding: theme.spacing.xlarge }}>
        <Heading id={headingId} type="h4">
          {title}
        </Heading>

        <Box marginY="large">{children}</Box>

        <div css={{ display: 'flex', justifyContent: 'flex-end' }}>
          {cancel && (
            <Button
              disabled={confirm.loading}
              key={cancel.label}
              onClick={cancel.action}
              weight="none"
              tone="passive"
            >
              {cancel.label}
            </Button>
          )}
          <Button
            css={{ marginLeft: theme.spacing.medium }}
            key={confirm.label}
            isLoading={confirm.loading}
            onClick={confirm.action}
            tone={tone}
          >
            {confirm.label}
          </Button>
        </div>
      </div>
    </DialogBase>
  );
};
