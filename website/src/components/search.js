import React, { Component } from 'react';
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';

import { colors } from '../styles';

// @jsx jsx

// Search component
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ``,
      results: [],
    };
  }

  render() {
    return (
      <div>
        <input
          type="text"
          css={{
            background: colors.B.A15,
            padding: 10,
            fontSize: '1em',
            //border: `2px solid ${colors.B.base}`,
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
          }}
          value={this.state.query}
          onChange={this.search}
          placeholder="Search"
        />
        <ul
          css={{
            background: 'white',
            boxShadow: `0 3px 10px rgba(0,0,0,0.25)`,
            maxWidth: 300,
            listStyle: 'none',
            position: 'absolute',
            right: 21,
            top: 40,
            padding: 5,
            fontSize: '0.8em',
            display: this.state.results.length ? 'block' : 'none',
          }}
        >
          {this.state.results.slice(0, 12).map(result => (
            <li css={{ padding: 5, borderBottom: `1px solid ${colors.B.A25}` }}>
              <Link style={{ color: colors.B.base }} to={result.slug}>
                {result.slug}
              </Link>{' '}
              <small style={{ color: 'grey' }}>({result.workspace})</small>
            </li>
          ))}
        </ul>
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
