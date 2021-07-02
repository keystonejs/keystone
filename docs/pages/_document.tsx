/** @jsx jsx */
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import React from 'react';
import { jsx, CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import createEmotionServer, { EmotionCriticalToChunks } from '@emotion/server/create-instance';

import { SkipLinks } from '../components/SkipLinks';
import { GA_TRACKING_ID } from '../lib/analytics';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    let originalRenderPage = ctx.renderPage;
    let data: EmotionCriticalToChunks | undefined;
    ctx.renderPage = async () => {
      const cache = createCache({ key: 'css' });
      const { extractCriticalToChunks } = createEmotionServer(cache);
      const result = await originalRenderPage({
        enhanceApp: App => props =>
          (
            <CacheProvider value={cache}>
              <App {...props} />
            </CacheProvider>
          ),
      });

      data = extractCriticalToChunks(result.html);
      return result;
    };
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: (
        <React.Fragment>
          {initialProps.styles}
          {data!.styles.map(data => (
            <style
              data-emotion={`${data.key} ${data.ids.join(' ')}`}
              dangerouslySetInnerHTML={{ __html: data.css }}
            />
          ))}
        </React.Fragment>
      ),
    };
  }

  render() {
    const siteUrl = process.env.siteUrl;
    const metaTitle = 'KeystoneJS: The superpowered Node.js Headless CMS for developers';
    const metaDescription =
      'Build faster and scale further with the programmable GraphQL API back-end for structured content projects. Ship better Apps, Websites, eCommerce, & more…';
    return (
      <Html>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="mask-icon" color="#2684FF" href="/safari-pinned-tab.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />

          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:image" content={`${siteUrl}/og-image-landscape.png`} />
          <meta property="og:image:width" content="761" />
          <meta property="og:image:height" content="410" />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="en" />

          <meta name="twitter:title" content={metaTitle} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={`${siteUrl}/og-image-landscape.png`} />

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
          <script
            async
            src="https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js"
          />
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
