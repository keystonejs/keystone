/* @jsx jsx */

import { jsx, Stack } from '@keystone-ui/core';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { SignoutButton } from '../../components/SignoutButton';
import { ErrorContainer } from '../../components/Errors';

export const NoAccessPage = ({ sessionsEnabled }: { sessionsEnabled: boolean }) => {
  return (
    <ErrorContainer>
      <Stack align="center" gap="medium">
        <AlertTriangleIcon size="large" />
        <div>You don't have access to this page.</div>
        {sessionsEnabled ? <SignoutButton /> : null}
      </Stack>
    </ErrorContainer>
  );
};
