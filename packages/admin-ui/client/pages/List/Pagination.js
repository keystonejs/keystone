// @flow

import React from 'react';
import { Pagination } from '@voussoir/ui/src/primitives/navigation';

type Props = {
  currentPage: number,
  itemsCount: number,
  list: Object,
  onChangePage: (*) => void,
  pageSize: number,
};

export default function ListPagination({
  currentPage,
  itemsCount,
  list,
  onChangePage,
  pageSize,
}: Props) {
  return (
    <Pagination
      currentPage={currentPage}
      displayCount
      onChange={onChangePage}
      pageSize={pageSize}
      plural={list.plural}
      single={list.label}
      total={itemsCount}
    />
  );
}
