/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment } from 'react';
import { jsx, Box, Stack } from '@keystone-ui/core';
import { LoadingDots, loadingToneValues } from '@keystone-ui/loading';

import { Page } from '../../components/Page';
import { toLabel } from '../../utils';

export default function LoadingPage() {
  return (
    <Page>
      <h1>Notice</h1>
      <h2>Tone</h2>
      <p>Tone changes the color of the notice, and its icon</p>
      {loadingToneValues.map(tone => (
        <Fragment>
          <h3>{tone}</h3>
          <Stack across gap="large">
            <LoadingDots
              label={`${toLabel(tone)} is loading`}
              key={tone}
              tone={tone}
              size="large"
            />
            <LoadingDots
              label={`${toLabel(tone)} is loading`}
              key={tone}
              tone={tone}
              size="medium"
            />
            <LoadingDots
              label={`${toLabel(tone)} is loading`}
              key={tone}
              tone={tone}
              size="small"
            />
          </Stack>
        </Fragment>
      ))}
      <h2>Current Color Support</h2>
      <p>The loading spinner will default to the current color if you don't pass a tone:</p>
      <Box foreground="teal400">
        Teal Color Text
        <LoadingDots label={`Loading current color`} size="medium" />
      </Box>
    </Page>
  );
}
