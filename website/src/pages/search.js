import React, { useMemo } from 'react';
import { Link } from 'gatsby';
import { jsx, Global } from '@emotion/core';
import { Input } from '@arch-ui/input';
import { Location as _Location } from '@reach/router';

/** @jsx jsx */

import { colors } from '@arch-ui/theme';

import Header from '../components/Header';
import Footer from '../components/Footer';

let Render = ({ children }) => children();

let Location = ({ children, ...props }) => (
  <_Location {...props}>{val => <Render>{() => children(val)}</Render>}</_Location>
);

function prettyTitle(node) {
  let pretty = node.slug
    .replace(node.workspace.replace('@', ''), '')
    .replace(new RegExp(/(\/)/g), ' ')
    .replace('-', ' ')
    .trim();

  if (pretty.startsWith('packages') || pretty.startsWith('types')) {
    pretty = pretty.replace('packages', '').replace('types', '');
  }

  return pretty === '' ? 'index' : pretty;
}

const Search = props => {
  return (
    <Location>
      {({ location, navigate }) => {
        let query = useMemo(
          () => {
            return new URL(location.href).searchParams.get('q');
          },
          [location.href]
        );
        let results = useMemo(
          () => {
            if (!query || !window.__LUNR__) return [];
            const lunrIndex = window.__LUNR__[props.lng || 'en'];
            const results = lunrIndex.index.search(query); // you can  customize your search , see https://lunrjs.com/guides/searching.html
            return (
              results
                .map(({ ref }) => lunrIndex.store[ref])
                // Make sure `tutorials` are always first
                .sort((a, b) =>
                  a.workspace !== b.workspace && a.workspace === 'tutorials' ? -1 : 0
                )
            );
            return results;
          },
          [query]
        );

        return (
          <React.Fragment>
            <Global
              styles={{
                body: {
                  margin: 0,
                  color: colors.B.D55,
                  background: colors.B.bg,
                  fontFamily:
                    'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
                },

                'pre[class*="language-"]': {
                  background: 'white',
                  fontSize: '0.8em',
                  width: '100%',
                  maxWidth: 600,
                },
              }}
            />
            <Header />
            <div
              css={{
                height: 'calc(100vh - 66px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  css={{
                    maxWidth: 900,
                    margin: '0 auto',
                    padding: 16,
                  }}
                >
                  <h1>Search Results for '{query}'</h1>
                  <Input
                    type="text"
                    value={query}
                    onChange={event => {
                      navigate(location.pathname + '?q=' + encodeURIComponent(event.target.value));
                    }}
                    placeholder="Search"
                  />
                  {results.length ? (
                    <ul css={{ padding: 0 }}>
                      {results.map(result => (
                        <li
                          css={{
                            padding: 10,
                            borderBottom: `1px solid ${colors.B.A25}`,
                            listStyle: 'none',
                          }}
                          key={result.slug}
                        >
                          <div>
                            <Link
                              style={{
                                fontSize: '1.25em',
                                color: colors.B.base,
                                textTransform: 'capitalize',
                              }}
                              to={result.slug}
                            >
                              {prettyTitle(result)}
                            </Link>
                            <small style={{ color: 'grey' }}>({result.workspace})</small>
                          </div>
                          <p css={{ marginBottom: 0 }}>{result.preview}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              <Footer />
            </div>
          </React.Fragment>
        );
      }}
    </Location>
  );
};

export default Search;
