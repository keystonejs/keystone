import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql, StaticQuery } from 'gatsby';

import keystoneIllustration from '../assets/illustration.png';

export const SiteMeta = ({ pathname }) => (
  <StaticQuery
    query={graphql`
      query SiteMetadata {
        site {
          siteMetadata {
            siteUrl
            title
            twitter
          }
        }
      }
    `}
    render={({
      site: {
        siteMetadata: { siteUrl, title, twitter },
      },
    }) => {
      // NOTE: site.webmanifest is handled in "gatsby-config.js" by "gatsby-plugin-manifest"
      return (
        <Helmet defaultTitle={title} titleTemplate={`%s | ${title}`}>
          <html lang="en" />
          <link rel="canonical" href={`${siteUrl}${pathname}`} />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover"
          />

          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32X32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16X16.png" />
          <link rel="mask-icon" color="#2684FF" href="/safari-pinned-tab.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="msapplication-TileColor" content="#2684FF" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="theme-color" content="#ffffff" />

          <meta property="og:url" content={siteUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="en" />
          <meta property="og:site_name" content={title} />
          <meta property="og:image" content={`${siteUrl}${keystoneIllustration}`} />
          <meta property="og:image:width" content="382" />
          <meta property="og:image:height" content="382" />

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content={twitter} />
          <meta name="twitter:image" content="/og-image.png" />
        </Helmet>
      );
    }}
  />
);
