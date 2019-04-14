/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, memo } from 'react';

import { ChevronLeftIcon, PlusIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { PageTitle } from '@arch-ui/typography';
import Tooltip from '@arch-ui/tooltip';

import { IdCopy } from './IdCopy';
import { Search } from './Search';

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
      <PageTitle>{titleText}</PageTitle>
      <FlexGroup align="center" justify="space-between" css={{ marginBottom: '0.9rem' }}>
        <div>
          <IconButton iconSize={16} variant="subtle" icon={ChevronLeftIcon} to={listHref}>
            Back
          </IconButton>
          <Search list={list} />
        </div>
        <div>
          <IdCopy id={item.id} />
          <Tooltip content="Create" hideOnMouseDown hideOnKeyDown>
            {ref => (
              <IconButton
                ref={ref}
                iconSize={16}
                variant="subtle"
                icon={PlusIcon}
                id={cypressId}
                onClick={onCreateClick}
              />
            )}
          </Tooltip>
        </div>
      </FlexGroup>
    </Fragment>
  );
});
