// @flow
import React, { type Ref } from 'react';

import { GearIcon } from '@voussoir/icons';
import { FlexGroup } from '@voussoir/ui/src/primitives/layout';
import { IconButton } from '@voussoir/ui/src/primitives/buttons';
import { Pagination } from '@voussoir/ui/src/primitives/navigation';
import List from '../../classes/List';

type Props = {
  currentPage: number,
  getManageButton: Ref<*>,
  itemsCount: number,
  list: List,
  onChangePage: (*) => void,
  onToggleManage: (*) => void,
  pageSize: number,
};

export default function ListPagination({
  currentPage,
  getManageButton,
  itemsCount,
  list,
  onChangePage,
  onToggleManage,
  pageSize,
}: Props) {
  return (
    <FlexGroup align="center">
      <IconButton
        icon={GearIcon}
        innerRef={getManageButton}
        onClick={onToggleManage}
        variant="ghost"
        style={{ marginRight: '0.5em' }}
        data-test-name="manage"
      >
        Manage
      </IconButton>
      <div id="ks-pagination">
        <Pagination
          currentPage={currentPage}
          displayCount
          onChange={onChangePage}
          pageSize={pageSize}
          plural={list.plural}
          single={list.label}
          total={itemsCount}
        />
      </div>
    </FlexGroup>
  );
}
