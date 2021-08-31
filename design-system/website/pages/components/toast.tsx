/** @jsxRuntime classic */
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
                addToast({ title: `${titleCase(tone)} toast`, tone });
              }}
            >
              Add {tone} toast
            </Button>
          );
        })}
        <Button
          onClick={() => {
            addToast({
              title: `Title`,
              message:
                'Optional long-form message content, to give the user additional information or context',
              tone: 'help',
            });
          }}
        >
          Add toast with message
        </Button>
      </Stack>
    </Page>
  );
}

function titleCase(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}
