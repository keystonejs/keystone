import React from 'react';
import { FlexGroup } from '@arch-ui/layout';
import { Pill } from '@arch-ui/pill';
import { gridSize } from '@arch-ui/theme';

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

export default function ActiveFilters({ filterList, onClear, onRemove, onUpdate }: Props) {
  return (
    <AnimateHeight
      style={{ paddingTop: gridSize }}
      render={ref => (
        <FlexGroup ref={ref} wrap id="ks-list-active-filters">
          {filterList.length
            ? filterList.map(filter => {
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
                        style={pillStyle}
                      >
                        {label}
                      </Pill>
                    )}
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
      )}
    />
  );
}
