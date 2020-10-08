/** @jsx jsx */

import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { useToasts } from '@keystone-ui/toast';

import { Page } from '../../components/Page';

export default function OptionsPage() {
  const { addToast } = useToasts();
  return (
    <Page>
      <Stack marginTop="large" gap="small">
        {(['positive', 'negative', 'warning', 'help'] as const).map(tone => {
          return (
            <Button
              onClick={() => {
                addToast({ title: 'Basic toast', tone });
              }}
            >
              Add {tone} Toast
            </Button>
          );
        })}
      </Stack>
    </Page>
  );
}
