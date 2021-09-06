/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Box, useTheme, Center } from '@keystone-ui/core';

import { Page } from '../../components/Page';
import { Code } from '../../components/Code';

export default function CenterPage() {
  const { palette } = useTheme();
  return (
    <Page>
      <h1>Center</h1>
      <p>
        This component uses <Code>display: flex</Code> to center its children.
      </p>

      <h2>Usage</h2>
      <Center padding="large" width={500} rounding="medium" css={{ borderWidth: '1px' }}>
        <Box
          margin="medium"
          padding="medium"
          rounding="medium"
          foreground="pink900"
          background="pink200"
          css={{ borderWidth: '1px', borderColor: palette.pink600 }}
        >
          I am centered
        </Box>
      </Center>
    </Page>
  );
}
