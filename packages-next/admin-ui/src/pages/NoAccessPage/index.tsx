/* @jsx jsx */

import { jsx, Stack } from '@keystone-ui/core';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { SignoutButton } from '../../components/SignoutButton';
import { ErrorContainer } from '../../components/Errors';

type NoAccessPage = { sessionsEnabled: boolean };

export const getNoAccessPage = (props: NoAccessPage) => () => <NoAccessPage {...props} />;

export const NoAccessPage = ({ sessionsEnabled }: NoAccessPage) => {
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
