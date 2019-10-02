/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo, Fragment } from 'react';

import { ChevronLeftIcon, PlusIcon, DiffIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { PageTitle } from '@arch-ui/typography';
import Tooltip from '@arch-ui/tooltip';
import { gridSize } from '@arch-ui/theme';

import { IdCopy } from './IdCopy';
import { Search } from './Search';

const HeaderInset = props => (
  <div css={{ paddingLeft: gridSize * 2, paddingRight: gridSize * 2 }} {...props} />
);

export let ItemTitle = memo(function ItemTitle({ titleText, id, list, adminPath, onCreateClick, onDuplicateClick }) {
  const listHref = `${adminPath}/${list.path}`;
  const cypressCreateId = 'item-page-create-button';
  const cypressDuplicateId = 'item-page-duplicate-button';

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
        <div>
          <IdCopy id={id} />
          {list.access.create ? (
            <Fragment>
              <Tooltip content="Duplicate" hideOnMouseDown hideOnKeyDown>
                {ref => (
                  <IconButton
                    ref={ref}
                    css={{ marginRight: -12 }}
                    variant="subtle"
                    icon={DiffIcon}
                    id={cypressDuplicateId}
                    onClick={onDuplicateClick}
                  />
                )}
              </Tooltip>
              <Tooltip content="Create" hideOnMouseDown hideOnKeyDown>
                {ref => (
                  <IconButton
                    ref={ref}
                    css={{ marginRight: -12 }}
                    variant="subtle"
                    icon={PlusIcon}
                    id={cypressCreateId}
                    onClick={onCreateClick}
                  />
                )}
              </Tooltip>
            </Fragment>
          ) : null}
        </div>
      </FlexGroup>
    </HeaderInset>
  );
});
