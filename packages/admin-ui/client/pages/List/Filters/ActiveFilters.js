/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FlexGroup } from '@arch-ui/layout';
import { Pill } from '@arch-ui/pill';
import { Button } from '@arch-ui/button';
import { gridSize } from '@arch-ui/theme';

import EditFilterPopout from './EditFilterPopout';
import AddFilterPopout from './AddFilterPopout';
import { useListFilter } from '../dataHooks';

export const elementOffsetStyles = { marginBottom: gridSize / 2, marginTop: gridSize / 2 };

export type FilterType = {
  field: { label: string, list: Object, path: string, type: string },
  filter: { type: string, label: string, getInitialValue: () => string },
  label: string,
  value: string,
};
type Props = {
  list: object,
};

export default function ActiveFilters({ list }: Props) {
  const { filters, onAdd, onRemove, onRemoveAll, onUpdate } = useListFilter(list.key);
  const cypressId = 'ks-list-active-filters';

  return (
    <FlexGroup wrap id={cypressId}>
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
        >
          Clear All
        </Button>
      ) : null}
    </FlexGroup>
  );
}
