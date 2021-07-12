/** @jsx jsx */
import { Fragment } from 'react';
import { jsx, Stack, Text, H1 } from '@keystone-ui/core';
import { Navigation } from '@keystone-next/keystone/admin-ui/components';
// Please note that while this capability is driven by NextJS's pages directory
// We do not currently expose any of the auxillary methods that NextJS provides i.e. `getStaticProps`
// Presently the only export from the directory that is respected is the page component itself.
export default function CustomPage() {
  return (
    <Fragment>
      <Navigation />
      <Stack
        as="main"
        gap="small"
        css={{
          margin: '0 auto',
          width: '60%',
        }}
      >
        <H1
          css={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          Hello this is a custom page
        </H1>
        <Text
          as="p"
          css={{
            textAlign: 'center',
          }}
        >
          This is a custom page added to the admin-ui, leveraging layout components from{' '}
          <em>@keystone-ui/core</em>
        </Text>
      </Stack>
    </Fragment>
  );
}
