import React from 'react';
import { ToastProvider } from '@keystone-ui/toast';
import { Page } from '../../components/Page';
import { H1 } from '../../components/Heading';

export default function IndexPage() {
  return (
    <Page isProse>
      <ToastProvider>
        <H1>Getting Started</H1>
        <p>(coming soon)</p>
      </ToastProvider>
    </Page>
  );
}
