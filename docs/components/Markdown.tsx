/** @jsx jsx  */
import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/react';
import { ReactNode } from 'react';

import { H1, H2, H3, H4, H5, H6 } from '../components/docs/Heading';
import { Code, InlineCode } from '../components/primitives/Code';
import { getHeadings } from '../lib/getHeadings';
import { DocsPage } from '../components/Page';

export const components = {
  code: Code,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  inlineCode: InlineCode,
};

export function Markdown({
  children,
  description,
  ...props
}: {
  children: ReactNode;
  description: string;
}) {
  const headings = getHeadings(children);

  return (
    <DocsPage headings={headings} title={headings[0].label} description={description} {...props}>
      <MDXProvider components={components}>{children}</MDXProvider>
    </DocsPage>
  );
}

export async function getServerSideProps() {
  const { readdirSync } = require('fs');
  const { normalize } = require('path');
  const dir = __dirname.endsWith('/server')
    ? normalize(`${__dirname}/../../pages/releases`)
    : normalize(`${__dirname}/../../../pages/releases`);

  const releases = (readdirSync(dir, 'utf8') as Array<string>)
    .filter(name => !name.startsWith('.') && !name.startsWith('index'))
    .map(name => name.replace('.mdx', ''))
    .reverse();

  return {
    props: {
      releases,
    },
  };
}
