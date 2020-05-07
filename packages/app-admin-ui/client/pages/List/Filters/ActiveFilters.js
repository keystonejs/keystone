/** @jsx jsx */

import { Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Pill } from '@arch-ui/pill';
import { Button } from '@arch-ui/button';
import { gridSize } from '@arch-ui/theme';

import EditFilterPopout from './EditFilterPopout';
import AddFilterPopout from './AddFilterPopout';
import { useListFilter } from '../dataHooks';

export const elementOffsetStyles = {
  marginBottom: gridSize / 2,
  marginTop: gridSize / 2,
  marginRight: gridSize / 2,
};

export default function ActiveFilters({ list }) {
  const { filters, onAdd, onRemove, onRemoveAll, onUpdate } = useListFilter();

  return (
    <Fragment>
      {filters.length
        ? filters.map(filter => {
            const label = filter.field.formatFilter(filter);

            return (
              <EditFilterPopout
                key={label}
                onChange={onUpdate}
                filter={filter}
                target={props => (
                  <Pill
                    {...props}
                    appearance="primary"
                    onRemove={onRemove(filter)}
                    css={elementOffsetStyles}
                  >
                    {label} {/* TODO: bold the first word; the field label */}
                  </Pill>
                )}
              />
            );
          })
        : null}

      <AddFilterPopout
        listKey={list.key}
        existingFilters={filters}
        fields={list.fields}
        onChange={onAdd}
      />

      {filters.length > 1 ? (
        <Button
          variant="subtle"
          appearance="warning"
          onClick={onRemoveAll}
          css={elementOffsetStyles}
          spacing="cozy"
        >
          Clear All
        </Button>
      ) : null}
    </Fragment>
  );
}
