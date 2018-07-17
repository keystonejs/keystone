/* global ENABLE_DEV_FEATURES */
import React from 'react';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import { Pill } from '@keystonejs/ui/src/primitives/pill';
import { gridSize } from '@keystonejs/ui/src/theme';

import AnimateHeight from '../../../components/AnimateHeight';
import EditFilterPopout from './EditFilterPopout';

const pillStyle = { marginBottom: gridSize / 2, marginTop: gridSize / 2 };

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
  filterList,
  onClear,
  onRemove,
  onUpdate,
}: Props) {
  if (!ENABLE_DEV_FEATURES) return null;

  return (
    <AnimateHeight style={{ paddingTop: gridSize }}>
      <FlexGroup wrap>
        {filterList.length
          ? filterList.map(filter => {
              const label = filter.field.formatFilter(filter);
              return (
                <EditFilterPopout
                  key={label}
                  onChange={onUpdate}
                  filter={filter}
                  target={
                    <Pill
                      appearance="primary"
                      onRemove={onRemove(filter)}
                      style={pillStyle}
                    >
                      {label}
                    </Pill>
                  }
                />
              );
            })
          : null}

        {filterList.length > 1 ? (
          <Pill key="clear" onClick={onClear} style={pillStyle}>
            Clear All
          </Pill>
        ) : null}
      </FlexGroup>
    </AnimateHeight>
  );
}
