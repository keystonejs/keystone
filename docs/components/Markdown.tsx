/** @jsx jsx  */
import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/react';

import { Code, InlineCode } from '../components/primitives/Code';
import { H1, H2, H3, H4, H5, H6 } from '../components/docs/Heading';
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

export function Markdown({ children, ...props }: { children: ReactNode }) {
  const headings = getHeadings(children);

  return (
    <DocsPage headings={headings} title={headings[0].label} {...props}>
      <MDXProvider components={components}>{children}</MDXProvider>
    </DocsPage>
  );
}

export async function getStaticProps() {
  return {
    props: {
      releases: ['one', 'two', 'three'],
    },
  };
}
