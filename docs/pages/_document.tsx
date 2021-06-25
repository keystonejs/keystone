/** @jsx jsx */
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { jsx } from '@emotion/react';

import { SkipLinks } from '../components/SkipLinks';
import { GA_TRACKING_ID } from '../lib/analytics';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    const siteUrl = process.env.siteUrl;
    return (
      <Html>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32X32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16X16.png" />
          <link rel="mask-icon" color="#2684FF" href="/safari-pinned-tab.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />

          <meta property="og:title" content="The superpowered CMS for developers" />
          <meta
            property="og:description"
            content="Keystone helps you build faster and scale further than any other CMS or App Framework. Just describe your schema, and get a powerful GraphQL API & beautiful Management UI for content and data."
          />
          <meta property="og:image" content={`${siteUrl}/og-image-landscape.png`} />
          <meta property="og:image:width" content="761" />
          <meta property="og:image:height" content="410" />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="en" />

<<<<<<< Updated upstream
          <meta name="twitter:title" content="The superpowered CMS for developers" />
          <meta
            name="twitter:description"
            content="Keystone helps you build faster and scale further than any other CMS or App Framework. Just describe your schema, and get a powerful GraphQL API & beautiful Management UI for content and data."
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={`${siteUrl}/og-image-square.png`} />
=======
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:image" content={`${siteUrl}/og-image-landscape.png`} />
>>>>>>> Stashed changes

          <meta name="msapplication-TileColor" content="#2684FF" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="theme-color" content="#ffffff" />

          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap"
            rel="stylesheet"
          />

          <script async src="/assets/resize-observer-polyfill.js" />
          <script async src="/assets/focus-visible-polyfill.js" />
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_TRACKING_ID}');
          `,
            }}
          />
        </Head>
        <body
          css={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          <SkipLinks />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
