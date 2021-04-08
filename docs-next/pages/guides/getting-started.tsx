import React from 'react';
import { Page } from '../../components/Page';
import { ComingSoon } from '../../components/ComingSoon';
import { H1 } from '../../components/Heading';

export default function GettingStarted() {
  return (
    <Page isProse>
      <H1>Getting Started</H1>
      <ComingSoon />
    </Page>
  );
}
