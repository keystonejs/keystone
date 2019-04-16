// @flow
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ListOrderedIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { LoadingSpinner } from '@arch-ui/loading';

import Page from './Page';
import type { LabelType, OnChangeType } from './types';

function ariaPageLabelFn(page: number) {
  return `Go to page ${page}`;
}

export type PaginationProps = {
  ariaPageLabel: LabelType,
  currentPage: number,
  limit?: number,
  onChange: OnChangeType,
  pageSize: number,
  total: number,
  isLoading: boolean,
};

const PageChildren = ({ page, isLoading, isSelected }) => {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading && isSelected) {
      const id = setTimeout(() => {
        setShouldShowLoading(true);
      }, 200);
      return () => {
        clearTimeout(id);
        setShouldShowLoading(false);
      };
    }
  }, [page, isLoading, isSelected]);

  return shouldShowLoading ? (
    <div css={{ height: 19 }}>
      <LoadingSpinner />
    </div>
  ) : (
    <span>{page}</span>
  );
};

type State = { allPagesVisible: boolean };

class Pagination extends Component<PaginationProps, State> {
  static defaultProps = {
    ariaPageLabel: ariaPageLabelFn,
    currentPage: 1,
    limit: 5,
  };
  state = { allPagesVisible: false };

  toggleAllPages = () => {
    this.setState(state => ({ allPagesVisible: !state.allPagesVisible }));
  };

  renderPages() {
    let { ariaPageLabel, currentPage, limit, pageSize, total } = this.props;

    if (total <= pageSize) return [];

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
        this.setState({ allPagesVisible: false });
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
          aria-current={isSelected ? 'page' : null}
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

    // return pages;
    return [
      <Page
        aria-label="Go to previous page"
        key="page_prev"
        onClick={onChange}
        value={currentPage - 1}
        isDisabled={currentPage === 1}
      >
        <ChevronLeftIcon />
      </Page>,
      this.state.allPagesVisible ? (
        pages
      ) : (
        <Page
          aria-label="Click to show all pages"
          key="page_dot"
          onClick={this.toggleAllPages}
          id="ks-pagination-show-pages"
          value={1} // needs value for flow...
        >
          <ListOrderedIcon />
        </Page>
      ),
      <Page
        aria-label="Go to next page"
        key="page_next"
        onClick={onChange}
        value={currentPage + 1}
        isDisabled={currentPage === totalPages}
      >
        <ChevronRightIcon />
      </Page>,
    ];
  }

  render() {
    // strip props to get `rest` attributes; things id, className etc.
    const {
      ariaPageLabel,
      currentPage,
      isLoading,
      limit,
      onChange,
      pageSize,
      total,
      ...rest
    } = this.props;
    return (
      // $FlowFixMe flex group doesn't understand default props for some reason, in this instance...
      <FlexGroup as="nav" align="center" aria-label="Pagination" isContiguous isInline {...rest}>
        {this.renderPages()}
      </FlexGroup>
    );
  }
}

export default Pagination;
