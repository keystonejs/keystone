/** @jsx jsx */
import { jsx, Stack } from '@keystone-ui/core';
// Please note that while this capability is driven by NextJS's pages directory
// We do not currently expose any of the auxillary methods that NextJS provides i.e. `getStaticProps`
// Presently the only export from the directory that is respected is the page component itself.
export default function () {
  return (
    <Stack as="main" gap="sm">
      <h1
        css={{
          maxWidth: '80%',
          width: '100%',
          textAlign: 'center',
        }}
      >
        Hello this is a custom page
      </h1>
      <p>This is a custom page added to the admin-ui</p>
    </Stack>
  );
}
