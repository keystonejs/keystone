/** @jsx jsx */
import { jsx, Box, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
export default function ComingSoon() {
  return (
    <Box
      padding="medium"
      rounding="medium"
      foreground="cyan900"
      background="neutral100"
      css={{ borderWidth: '1px' }}
    >
      <Stack
        css={{
          width: '100%',
          justifyContent: 'space-between',
        }}
        gap="small"
        align="center"
        across
      >
        <p css={{ margin: '0 !important ' }}>
          Coming Soon...Visit our roadmap for more inforamtion
        </p>
        <Button tone="active">Roadmap</Button>
      </Stack>
    </Box>
  );
}
