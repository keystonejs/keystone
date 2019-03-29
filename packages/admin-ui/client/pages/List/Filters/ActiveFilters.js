/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Pill } from '@arch-ui/pill';
import { gridSize } from '@arch-ui/theme';

import AddFilterPopout from './AddFilterPopout';
import EditFilterPopout from './EditFilterPopout';

const pillStyle = { marginBottom: gridSize / 2, marginLeft: gridSize / 2 };

export type FilterType = {
  field: { label: string, list: Object, path: string, type: string },
  filter: { type: string, label: string, getInitialValue: () => string },
  label: string,
  value: string,
};
type Props = {
  filterList: Array<FilterType>,
  onClear: FilterType => void,
  onRemove: FilterType => void,
  onUpdate: FilterType => void,
};

export default function ActiveFilters({
  fields,
  filterList,
  onAdd,
  onClear,
  onRemove,
  onUpdate,
}: Props) {
  return (
    <>
      {filterList.length
        ? filterList.map(filter => {
            const labelArray = filter.field.formatFilter(filter).split(' ');
            return (
              <EditFilterPopout
                key={labelArray.join('-')}
                onChange={onUpdate}
                filter={filter}
                target={props => (
                  <Pill {...props} onRemove={onRemove(filter)} css={pillStyle}>
                    <strong css={{ fontWeight: 500 }}>{labelArray[0]}&nbsp;</strong>
                    {labelArray.slice(1).join(' ')}
                  </Pill>
                )}
              />
            );
          })
        : null}

      <AddFilterPopout existingFilters={filterList} fields={fields} onChange={onAdd} />

      {filterList.length > 1 ? (
        <Pill key="clear" onClick={onClear} style={pillStyle} nuanced>
          Clear All
        </Pill>
      ) : null}
    </>
  );
}
