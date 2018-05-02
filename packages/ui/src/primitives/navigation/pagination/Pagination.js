// @flow

import React, { Component } from 'react';
import styled from 'react-emotion';

import Page from './Page';
import manageState from './stateManager';
import type { CountFormat, LabelType, OnChangeType } from './types';

function getRange({ value, pageSize, total }) {
  if (!total) {
    return {};
  } else {
    const start = pageSize * (value - 1) + 1;
    const end = Math.min(start + pageSize - 1, total);
    return { start, end };
  }
}

type PaginationProps = {
  ariaPageLabel: LabelType,
  countFormatter: CountFormat,
  displayCount: boolean,
  limit?: number,
  onChange: OnChangeType,
  pageSize: number,
  plural: string,
  singular: string,
  total: number,
  value: number,
};
const PaginationElement = styled.nav({
  alignItems: 'center',
  display: 'flex',
});
const PageCount = styled.div({
  marginRight: '1em',
});

class Pagination extends Component<PaginationProps> {
  renderCount() {
    let {
      countFormatter,
      displayCount,
      pageSize,
      plural,
      singular,
      total,
    } = this.props;

    if (!displayCount) return null;

    const { start, end } = getRange(this.props);
    const count = countFormatter({
      end,
      pageSize,
      plural,
      singular,
      start,
      total,
    });

    return <PageCount>{count}</PageCount>;
  }
  renderPages() {
    let { ariaPageLabel, value, limit, onChange, pageSize, total } = this.props;

    if (total <= pageSize) return null;

    let pages = [];
    let totalPages = Math.ceil(total / pageSize);
    let minPage = 1;
    let maxPage = totalPages;
    const moreCharacter = <span>&hellip;</span>;

    if (limit && limit < totalPages) {
      let rightLimit = Math.floor(limit / 2);
      let leftLimit = rightLimit + limit % 2 - 1;
      minPage = value - leftLimit;
      maxPage = value + rightLimit;

      if (minPage < 1) {
        maxPage = limit;
        minPage = 1;
      }
      if (maxPage > totalPages) {
        minPage = totalPages - limit + 1;
        maxPage = totalPages;
      }
    }

    // go to first
    if (minPage > 1) {
      pages.push(
        <Page
          aria-label={ariaPageLabel(1)}
          key="page_start"
          onClick={onChange}
          value={1}
        >
          {moreCharacter}
        </Page>
      );
    }

    // loop over range
    for (let page = minPage; page <= maxPage; page++) {
      const isSelected = page === value;
      pages.push(
        <Page
          aria-label={ariaPageLabel(page)}
          key={`page_${page}`}
          isSelected={isSelected}
          onClick={onChange}
          value={page}
        >
          {page}
        </Page>
      );
    }

    // go to last
    if (maxPage < totalPages) {
      pages.push(
        <Page
          aria-label={ariaPageLabel(totalPages)}
          key="page_end"
          onClick={onChange}
          value={totalPages}
        >
          {moreCharacter}
        </Page>
      );
    }

    return pages;
  }
  render() {
    return (
      <PaginationElement aria-label="Pagination">
        {this.renderCount()}
        {this.renderPages()}
      </PaginationElement>
    );
  }
}

export default manageState(Pagination);
