/** @jsx jsx */

import { Fragment, useState } from 'react';
import { jsx, Box, Stack } from '@keystone-ui/core';
import { Page } from '../../components/Page';
import { Button } from '@keystone-ui/button';
import { Drawer, DrawerController } from '@keystone-ui/modals';

export default function ModalsPage() {
  let [isNarrowOpen, setIsNarrowOpen] = useState(false);
  let [isWideOpen, setIsWideOpen] = useState(false);

  return (
    <Page>
      <h1>Modals</h1>
      <Stack gap="small">
        <Button
          tone="active"
          onClick={() => {
            setIsNarrowOpen(true);
          }}
        >
          Open Narrow Drawer
        </Button>
        <Button
          tone="active"
          onClick={() => {
            setIsWideOpen(true);
          }}
        >
          Open Wide Drawer
        </Button>
      </Stack>
      <DrawerController isOpen={isNarrowOpen}>
        <Drawer
          actions={{
            cancel: {
              action: () => setIsNarrowOpen(false),
              label: 'Cancel',
            },
            confirm: {
              action: () => setIsNarrowOpen(false),
              label: 'Save',
            },
          }}
          title="Some Drawer"
        >
          content
        </Drawer>
      </DrawerController>
      <DrawerController isOpen={isWideOpen}>
        <Drawer
          width="wide"
          actions={{
            cancel: {
              action: () => setIsWideOpen(false),
              label: 'Cancel',
            },
            confirm: {
              action: () => setIsWideOpen(false),
              label: 'Save',
            },
          }}
          title="Some Drawer"
        >
          content
        </Drawer>
      </DrawerController>
    </Page>
  );
}
