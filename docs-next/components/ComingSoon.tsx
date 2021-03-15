/** @jsx jsx */
import { jsx, Box, Stack, css } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import Link from 'next/link';

export const ComingSoon = () => {
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
          Coming Soon... Visit our roadmap for more information
        </p>
        <Link href="/roadmap" passHref>
          <Button
            css={css`
              text-decoration: none !important;
              color: #2563eb !important;
            `}
            as="a"
            tone="active"
          >
            Roadmap
          </Button>
        </Link>
      </Stack>
    </Box>
  );
};
