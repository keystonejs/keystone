import React from 'react';
// Please note that while this capability is driven by NextJS's pages directory
// We do not currently expose any of the auxillary methods that NextJS provides i.e. `getStaticProps`
// Presently the only export from the directory that is respected is the page component itself.
export default function () {
  return <h1>Hello this is a custom page</h1>;
}
