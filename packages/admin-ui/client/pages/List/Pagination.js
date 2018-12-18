// @flow

import React from 'react';
import { Pagination } from '@voussoir/ui/src/primitives/navigation';

type Props = {
  currentPage: number,
  itemsCount: number,
  list: Object,
  onChangePage: (*) => void,
  pageSize: number,
  isLoading: boolean,
};

const CYPRESS_TEST_ID = 'ks-pagination';

export default function ListPagination({
  currentPage,
  itemsCount,
  list,
  onChangePage,
  pageSize,
  isLoading,
}: Props) {
  return (
    <Pagination
      currentPage={currentPage}
      displayCount
      id={CYPRESS_TEST_ID}
      onChange={onChangePage}
      isLoading={isLoading}
      pageSize={pageSize}
      plural={list.plural}
      single={list.label}
      total={itemsCount}
    />
  );
}
