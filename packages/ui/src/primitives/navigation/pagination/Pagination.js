// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import styled from '@emotion/styled';

import { colors } from '../../../theme';
import Page from './Page';
import { LoadingSpinner } from '../../loading';
import type { CountArgs, CountFormat, LabelType, OnChangeType } from './types';
import { useEffect, useState } from '../../../new-typed-react';

function ariaPageLabelFn(page: number) {
  return `Go to page ${page}`;
}
function countFormatterFn({ end, pageSize, plural, singular, start, total }: CountArgs) {
  let count = '';

  if (!total) {
    count = 'No ' + (plural || 'records');
  } else if (total > pageSize) {
    count = `Showing ${start} to ${end} of ${total}`;
  } else {
    count = 'Showing ' + total;
    if (total > 1 && plural) {
      count += ' ' + plural;
    } else if (total === 1 && singular) {
      count += ' ' + singular;
    }
  }

  return count;
}
function getRange({ currentPage, pageSize, total }) {
  if (!total) {
    return {};
  } else {
    const start = pageSize * (currentPage - 1) + 1;
    const end = Math.min(start + pageSize - 1, total);
    return { start, end };
  }
}

export type PaginationProps = {
  ariaPageLabel: LabelType,
  countFormatter: CountFormat,
  currentPage: number,
  displayCount: boolean,
  limit?: number,
  onChange: OnChangeType,
  pageSize: number,
  plural: string,
  singular: string,
  total: number,
  isLoading: boolean,
};

const PaginationElement = styled.nav({
  alignItems: 'center',
  display: 'flex',
});
const PageCount = styled.div({
  color: colors.N60,
  marginRight: '1em',
});

const PageChildren = ({ page, isLoading, isSelected }) => {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  useEffect(
    () => {
      if (isLoading && isSelected) {
        const id = setTimeout(() => {
          setShouldShowLoading(true);
        }, 200);
        return () => {
          clearTimeout(id);
          setShouldShowLoading(false);
        };
      }
    },
    [page, isLoading, isSelected]
  );
  return shouldShowLoading ? (
    <div css={{ height: 19 }}>
      <LoadingSpinner />
    </div>
  ) : (
    <span>{page}</span>
  );
};

class Pagination extends Component<PaginationProps> {
  static defaultProps = {
    ariaPageLabel: ariaPageLabelFn,
    countFormatter: countFormatterFn,
    currentPage: 1,
    limit: 5,
    plural: 'Items',
    singular: 'Item',
  };

  renderCount() {
    let { countFormatter, displayCount, pageSize, plural, singular, total } = this.props;

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
    let { ariaPageLabel, currentPage, limit, pageSize, total } = this.props;

    if (total <= pageSize) return null;

    let pages = [];
    let totalPages = Math.ceil(total / pageSize);
    let minPage = 1;
    let maxPage = totalPages;
    const moreCharacter = <span>&hellip;</span>;

    if (limit && limit < totalPages) {
      let rightLimit = Math.floor(limit / 2);
      let leftLimit = rightLimit + (limit % 2) - 1;
      minPage = currentPage - leftLimit;
      maxPage = currentPage + rightLimit;

      if (minPage < 1) {
        maxPage = limit;
        minPage = 1;
      }
      if (maxPage > totalPages) {
        minPage = totalPages - limit + 1;
        maxPage = totalPages;
      }
    }

    const onChange = page => {
      if (this.props.onChange) {
        this.props.onChange(page, {
          pageSize,
          total,
          minPage,
          maxPage,
        });
      }
    };

    // go to first
    if (minPage > 1) {
      pages.push(
        <Page aria-label={ariaPageLabel(1)} key="page_start" onClick={onChange} value={1}>
          {moreCharacter}
        </Page>
      );
    }

    // loop over range
    for (let page = minPage; page <= maxPage; page++) {
      const isSelected = page === currentPage;
      pages.push(
        <Page
          aria-label={ariaPageLabel(page)}
          key={`page_${page}`}
          isSelected={isSelected}
          onClick={onChange}
          value={page}
        >
          <PageChildren isLoading={this.props.isLoading} page={page} isSelected={isSelected} />
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
    // strip props to get `rest` attributes; things id, className etc.
    const {
      ariaPageLabel,
      countFormatter,
      currentPage,
      displayCount,
      limit,
      onChange,
      pageSize,
      plural,
      singular,
      total,
      ...rest
    } = this.props;
    return (
      <PaginationElement aria-label="Pagination" {...rest}>
        {this.renderCount()}
        {this.renderPages()}
      </PaginationElement>
    );
  }
}

export default Pagination;
