/** @jsx jsx */
import { Fragment } from 'react';
import { jsx } from '@keystone-ui/core';
// Please note that while this capability is driven by NextJS's pages directory
// We do not currently expose any of the auxillary methods that NextJS provides i.e. `getStaticProps`
// Presently the only export from the directory that is respected is the page component itself.
export default function CustomPage() {
  return (
    <Fragment>
      <main
        css={{
          margin: '0 auto',
          width: '60%',
        }}
      >
        <h1
          css={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          Hello this is a custom page
        </h1>
        <p
          css={{
            textAlign: 'center',
          }}
        >
          This is a custom page added to the Admin UI, leveraging <em>@keystone-ui/core</em>
        </p>
      </main>
    </Fragment>
  );
}
