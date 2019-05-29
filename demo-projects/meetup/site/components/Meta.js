/** @jsx jsx */

import getConfig from 'next/config';
import Head from 'next/head';
import { jsx } from '@emotion/core';

const {
  publicRuntimeConfig: { meetup },
} = getConfig();

export const makeMetaUrl = path => {
  const base = meetup.siteUrl;
  const url = base.endsWith('/') ? base.slice(0, base.length - 1) : base;
  return `${url}${path}`;
};

export default function PageMeta({ children, description, title, titleExclusive }) {
  const titleContent = titleExclusive ? titleExclusive : title ? `${title} | ${meetup.name}` : null;
  const logoPath = makeMetaUrl(meetup.logo.src);

  return (
    <Head>
      {titleContent && <title>{titleContent}</title>}
      {description && <meta name="description" content={description} />}
      {children}

      <meta property="og:url" content={meetup.siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en" />
      <meta property="og:site_name" content={meetup.name} />
      <meta property="og:image" content={logoPath} />
      <meta property="og:image:width" content={meetup.logo.width} />
      <meta property="og:image:height" content={meetup.logo.height} />
      <meta name="twitter:site" content={meetup.twitterHandle} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:image" content={logoPath} />
    </Head>
  );
}
