/** @jsx jsx */

import { useState } from 'react';
import { jsx, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { Drawer, DrawerController, AlertDialog } from '@keystone-ui/modals';
import { Page } from '../../components/Page';

export default function ModalsPage() {
  let [isNarrowOpen, setIsNarrowOpen] = useState(false);
  let [isWideOpen, setIsWideOpen] = useState(false);
  let [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

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
        <Button
          tone="active"
          onClick={() => {
            setIsAlertDialogOpen(true);
          }}
        >
          Open Alert Dialog
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
      <AlertDialog
        isOpen={isAlertDialogOpen}
        title="Something"
        actions={{
          cancel: {
            action: () => setIsAlertDialogOpen(false),
            label: 'Cancel',
          },
          confirm: {
            action: () => setIsAlertDialogOpen(false),
            label: 'Confirm',
          },
        }}
      >
        content
      </AlertDialog>
    </Page>
  );
}
