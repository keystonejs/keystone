import { Component } from 'react';
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { colors } from '@voussoir/ui/src/theme';

/** @jsx jsx */

const Input = styled.input({
  background: colors.B.A15,
  padding: 10,
  fontSize: '1em',
  border: 'none',
  borderRadius: 6,
  boxSizing: 'border-box',
  border: '2px solid transparent',

  '&:focus': {
    outline: 'none',
    borderColor: colors.B.base,
  },

  '&::placeholder': {
    color: colors.B.base,
  },
});

const ResultsList = styled.div({
  background: 'white',
  boxShadow: `0 3px 10px rgba(0,0,0,0.25)`,
  maxWidth: 300,
  padding: '0px 15px',
  position: 'absolute',
  right: 21,
  top: 60,
  fontSize: '1em',
});

// Search component
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ``,
      results: [],
    };
  }

  prettyTitle(node) {
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

  render() {
    return (
      <div>
        <Input type="text" value={this.state.query} onChange={this.search} placeholder="Search" />
        {this.state.results.length ? (
          <ResultsList>
            <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {this.state.results.slice(0, 12).map(result => (
                <li
                  css={{
                    padding: 10,
                    borderBottom: `1px solid ${colors.B.A25}`,
                  }}
                  key={result.slug}
                >
                  <Link
                    style={{ color: colors.B.base, textTransform: 'capitalize' }}
                    to={result.slug}
                  >
                    {this.prettyTitle(result)}
                  </Link>{' '}
                  <small style={{ color: 'grey' }}>({result.workspace})</small>
                </li>
              ))}
            </ul>
            <Link
              to={`/search?q=${this.state.query}`}
              css={{ textAlign: 'center', padding: 5, display: 'block', color: colors.B.base }}
            >
              See More
            </Link>
          </ResultsList>
        ) : null}
      </div>
    );
  }

  getSearchResults(query) {
    if (!query || !window.__LUNR__) return [];
    const lunrIndex = window.__LUNR__[this.props.lng || 'en'];
    const results = lunrIndex.index.search(query); // you can  customize your search , see https://lunrjs.com/guides/searching.html
    return (
      results
        .map(({ ref }) => lunrIndex.store[ref])
        // Make sure `docs` are always first
        .sort((a, b) => (a.workspace !== b.workspace && a.workspace === 'docs' ? -1 : 0))
    );
  }

  search = event => {
    const query = event.target.value;
    const results = this.getSearchResults(query);
    this.setState(() => ({ results, query }));
  };
}
