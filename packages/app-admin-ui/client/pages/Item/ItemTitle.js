/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';

import { ChevronLeftIcon, PlusIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { PageTitle } from '@arch-ui/typography';
import Tooltip from '@arch-ui/tooltip';
import { gridSize } from '@arch-ui/theme';

import { IdCopy } from './IdCopy';
import { Search } from './Search';
import { useUIHooks } from '../../providers/Hooks';
import { useItem } from '../../providers/Item';
import { useList } from '../../providers/List';

const HeaderInset = props => (
  <div css={{ paddingLeft: gridSize * 2, paddingRight: gridSize * 2 }} {...props} />
);
const ItemId = () => {
  let { id } = useItem();
  return <IdCopy id={id} />;
};

const AddNewItem = () => {
  let {
    list: { access },
    openCreateItemModal,
  } = useList();
  if (!access.create) return null;
  const cypressId = 'item-page-create-button';
  return (
    <Tooltip content="Create" hideOnMouseDown hideOnKeyDown>
      {ref => (
        <IconButton
          ref={ref}
          css={{ marginRight: -12 }}
          variant="subtle"
          icon={PlusIcon}
          id={cypressId}
          onClick={openCreateItemModal}
        />
      )}
    </Tooltip>
  );
};

export let ItemTitle = memo(function ItemTitle({ titleText, adminPath }) {
  let { list } = useList();
  const listHref = `${adminPath}/${list.path}`;
  let uiHooks = useUIHooks();
  let { itemHeaderActions } = uiHooks;
  return (
    <HeaderInset>
      <PageTitle>{titleText}</PageTitle>
      <FlexGroup align="center" justify="space-between" css={{ marginBottom: '0.9rem' }}>
        <div>
          <IconButton
            variant="subtle"
            icon={ChevronLeftIcon}
            to={listHref}
            css={{ marginLeft: -12 }}
          >
            Back
          </IconButton>
          <Search list={list} />
        </div>
        {itemHeaderActions ? (
          itemHeaderActions({ ItemId, AddNewItem })
        ) : (
          <div>
            <ItemId />
            <AddNewItem />
          </div>
        )}
      </FlexGroup>
    </HeaderInset>
  );
});
