// @flow

import React from 'react';
import { Pagination } from '@arch-ui/pagination';
import { useList, useListPagination } from './dataHooks';

type Props = {
  listKey: string,
};

const CYPRESS_TEST_ID = 'ks-pagination';

export default function ListPagination({ isLoading, listKey }: Props) {
  const list = useList(listKey);
  const { data, onChange } = useListPagination(listKey);

  return (
    <Pagination
      currentPage={data.currentPage}
      displayCount
      id={CYPRESS_TEST_ID}
      onChange={onChange}
      isLoading={isLoading}
      pageSize={data.pageSize}
      plural={list.plural}
      single={list.label}
      total={data.itemCount}
    />
  );
}
