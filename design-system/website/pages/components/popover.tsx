/** @jsxRuntime classic */
/** @jsx jsx */

import { Button } from '@keystone-ui/button';
import { Box, jsx } from '@keystone-ui/core';
import { Popover } from '@keystone-ui/popover';
import { Page } from '../../components/Page';

export default function PopoverPage() {
  return (
    <Page>
      <p>
        Popovers are small overlays that open on demand, and close when the user clicks outside or
        presses the escape key. They let users access additional content and actions without
        cluttering the page.
      </p>
      <p>
        The popover dialog has no dimensions of its own so it will expand or contract to contain the
        children provided. Consider this when using the popover, and be sure to provide appropriate
        styles for height and width.
      </p>
      <Popover triggerRenderer={({ triggerProps }) => <Button {...triggerProps}>Click me</Button>}>
        <Box tabIndex={0} width={180} height={80} padding="medium">
          I'm in a popover!
        </Box>
      </Popover>
    </Page>
  );
}
