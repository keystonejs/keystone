/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Box, useTheme } from '@keystone-ui/core';

import { Page } from '../../components/Page';
import { Code } from '../../components/Code';

export default function ThemePage() {
  const { palette } = useTheme();
  return (
    <Page>
      <h1>Box</h1>
      <p>
        The Box component allows you to easily select tokens from the theme and apply them to any
        type of component. By default, it will render a <Code>div</Code>
      </p>

      <h2>Usage</h2>
      <Box margin="medium" padding="medium" rounding="medium" css={{ borderWidth: '1px' }}>
        Box with margin, padding, and border
      </Box>
      <Box
        margin="medium"
        padding="medium"
        rounding="medium"
        foreground="cyan900"
        background="cyan200"
        css={{ borderWidth: '1px', borderColor: palette.cyan600 }}
      >
        Box with a cyan background and foreground color
      </Box>

      <h2>TODO</h2>
      <p>Add support for border properties, elevation, etc?</p>
    </Page>
  );
}
