/** @jsxRuntime classic */
/** @jsx jsx */

import { Stack, jsx } from '@keystone-ui/core';
import { Pill } from '@keystone-ui/pill';

import { Page } from '../../components/Page';

const toneValues = ['active', 'passive', 'positive', 'warning', 'negative', 'help'] as const;

export default function PillPage() {
  return (
    <Page>
      <h1>Pill</h1>
      <Stack across gap="xxlarge">
        <div>
          <h2>Bold weight</h2>
          <Stack gap="small">
            {toneValues.map(tone => (
              <Pill key={tone} weight="bold" tone={tone} onRemove={() => {}}>
                {tone}
              </Pill>
            ))}
          </Stack>
        </div>
        <div>
          <h2>Light weight</h2>
          <Stack gap="small">
            {toneValues.map(tone => (
              <Pill key={tone} weight="light" tone={tone} onRemove={() => {}}>
                {tone}
              </Pill>
            ))}
          </Stack>
        </div>

        <Stack gap="small">
          <h2>Without remove</h2>
          <Pill>No remove</Pill>
          <h2>With interaction</h2>
          <Pill onClick={() => alert('Clicked')}>Alert</Pill>
          <Pill onClick={() => alert('Clicked')} weight="light">
            Alert
          </Pill>
        </Stack>
      </Stack>
    </Page>
  );
}
