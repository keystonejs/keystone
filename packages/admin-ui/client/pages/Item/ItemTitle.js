/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, memo } from 'react';

import { ArrowLeftIcon, SearchIcon, PlusIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { A11yText, PageTitle } from '@arch-ui/typography';

import { IdCopy } from './IdCopy';

export let ItemTitle = memo(function ItemTitle({
  titleText,
  item,
  list,
  adminPath,
  onCreateClick,
}) {
  const listHref = `${adminPath}/${list.path}`;
  const cypressId = 'item-page-create-button';

  return (
    <Fragment>
      <FlexGroup align="center" justify="space-between" css={{ marginTop: '0.9rem' }}>
        <div>
          <IconButton iconSize={24} variant="subtle" icon={ArrowLeftIcon} to={listHref}>
            <A11yText>{list.label}</A11yText>
          </IconButton>
          <IconButton
            iconSize={24}
            variant="subtle"
            icon={SearchIcon}
            onClick={() => console.log('TODO')}
          >
            <A11yText>Search</A11yText>
          </IconButton>
          <IdCopy id={item.id} />
        </div>
        <div>
          <IconButton
            iconSize={24}
            variant="subtle"
            icon={PlusIcon}
            id={cypressId}
            onClick={onCreateClick}
          >
            <A11yText>Create</A11yText>
          </IconButton>
        </div>
      </FlexGroup>
      <PageTitle>{titleText}</PageTitle>
    </Fragment>
  );
});
