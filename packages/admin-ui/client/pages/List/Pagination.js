import React, { type Ref } from 'react';

import { GearIcon } from '@keystonejs/icons';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import { IconButton } from '@keystonejs/ui/src/primitives/buttons';
import { Pagination } from '@keystonejs/ui/src/primitives/navigation';

const DEFAULT_PAGE_SIZE = 50;

type Props = {
  currentPage: number,
  getManageButton: Ref<*>,
  itemsCount: number,
  list: Object,
  onChangePage: (*) => void,
  onToggleManage: (*) => void,
};

export default function ListPagination({
  currentPage,
  getManageButton,
  itemsCount,
  onChangePage,
  onToggleManage,
  list,
}: Props) {
  return (
    <FlexGroup align="center">
      <IconButton
        icon={GearIcon}
        innerRef={getManageButton}
        onClick={onToggleManage}
        variant="ghost"
        style={{ marginRight: '0.5em' }}
      >
        Manage
      </IconButton>
      <Pagination
        currentPage={currentPage}
        displayCount
        onChange={onChangePage}
        pageSize={DEFAULT_PAGE_SIZE}
        plural={list.plural}
        single={list.label}
        total={itemsCount}
      />
    </FlexGroup>
  );
}
