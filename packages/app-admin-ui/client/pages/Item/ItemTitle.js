/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';

import { ChevronLeftIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { PageTitle } from '@arch-ui/typography';

import { Search } from './Search';
import { useUIHooks } from '../../providers/Hooks';
import { useList } from '../../providers/List';
import AddNewItem from './AddNewItem';
import ItemId from './ItemId';
import { HeaderInset } from '../Home/components';

export const ItemTitle = memo(function ItemTitle({ titleText, adminPath }) {
  const { list } = useList();
  const listHref = `${adminPath}/${list.path}`;
  const { itemHeaderActions } = useUIHooks();
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
          itemHeaderActions()
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
