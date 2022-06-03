import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import React from 'react';
import createEmotionServer from '@emotion/server/create-instance';
import { cache } from '@emotion/css';

const { extractCriticalToChunks } = createEmotionServer(cache);

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const data = extractCriticalToChunks(initialProps.html);

    return {
      ...initialProps,
      styles: [
        <React.Fragment key="1">
          {initialProps.styles}
          {data!.styles.map((data, i) => (
            <style
              key={i}
              data-emotion={`${data.key} ${data.ids.join(' ')}`}
              dangerouslySetInnerHTML={{ __html: data.css }}
            />
          ))}
        </React.Fragment>,
      ],
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="mask-icon" color="#2684FF" href="/safari-pinned-tab.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="en" />
          <meta name="twitter:card" content="summary_large_image" />
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
          <script data-no-cookie data-respect-dnt async data-api="/_sb" src="/sb.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
