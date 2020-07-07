/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';

import { ChevronLeftIcon } from '@primer/octicons-react';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { gridSize } from '@arch-ui/theme';
import { PageTitle } from '@arch-ui/typography';

import { Search } from './Search';
import { useUIHooks } from '../../providers/Hooks';
import { useList } from '../../providers/List';
import AddNewItem from './AddNewItem';
import ItemId from './ItemId';

import ListDescription from '../../components/ListDescription';

const Container = ({ children }) => {
  const padding = gridSize * 2;
  return <div css={{ paddingLeft: padding, paddingRight: padding }}>{children}</div>;
};

export const ItemTitle = memo(function ItemTitle({ titleText }) {
  const { list } = useList();
  const { itemHeaderActions } = useUIHooks();
  return (
    <Container>
      <PageTitle>{titleText}</PageTitle>
      <ListDescription text={list.adminDoc} />
      <FlexGroup align="center" justify="space-between" css={{ marginBottom: '0.9rem' }}>
        <div>
          <IconButton
            variant="subtle"
            icon={ChevronLeftIcon}
            to={list.getFullPersistentPath()}
            css={{ marginLeft: -12 }}
          >
            {list.label}
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
    </Container>
  );
});
