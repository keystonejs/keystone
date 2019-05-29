/** @jsx jsx */

import getConfig from 'next/config';
import Head from 'next/head';
import { jsx } from '@emotion/core';

const {
  publicRuntimeConfig: { meetup },
} = getConfig();

export default function PageMeta({ children, description, title, titleExclusive }) {
  const titleContent = titleExclusive ? titleExclusive : title ? `${title} | ${meetup.name}` : null;
  return (
    <Head>
      {titleContent && <title>{titleContent}</title>}
      {description && <meta name="description" content={description} />}
      {children}
    </Head>
  );
}
