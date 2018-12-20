import React, { Component } from 'react';
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';

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
        <input type="text" value={this.state.query} onChange={this.search} placeholder="Search" />
        <ul
          css={{
            background: 'white',
            maxWidth: 250,
            position: 'absolute',
            right: 21,
            top: 40,
            padding: 10,
          }}
        >
          {this.state.results.map(result => (
            <li>
              <Link to={result.slug}>{result.slug}</Link>{' '}
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
