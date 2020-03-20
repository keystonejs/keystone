import React from 'react';

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        {props.headComponents}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.searchError = function() {window.searchErrored = true;};window.searchLoaded = function() {};',
          }}
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css"
        />
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <noscript key="noscript" id="gatsby-noscript">
          This app works best with JavaScript enabled.
        </noscript>
        <div key={`body`} id="___gatsby" dangerouslySetInnerHTML={{ __html: props.body }} />
        {props.postBodyComponents}
        {/*
          Polyfill for pseudo-selector `:focus-visible`
          https://github.com/WICG/focus-visible
        */}
        <script src="https://cdn.jsdelivr.net/npm/focus-visible@4.1.5/dist/focus-visible.min.js" />
        <div
          dangerouslySetInnerHTML={{
            __html:
              '<script src="https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js" onload="searchLoaded()" async defer onerror="searchError()"></script>',
          }}
        />
      </body>
    </html>
  );
}
