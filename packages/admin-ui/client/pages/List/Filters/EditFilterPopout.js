import React, { Component } from 'react';

import { POPOUT_GUTTER } from '../../../components/Popout';
import PopoutForm from './PopoutForm';

// This import is loaded by the @voussoir/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../../../FIELD_TYPES';

type Props = {
  filter: Object,
  onChange: Event => void,
};
type State = {
  value: string,
};

export default class EditFilterPopout extends Component<Props, State> {
  state = { value: this.props.filter.value };

  onChangeFilter = value => {
    this.setState({ value });
  };
  onSubmit = () => {
    const { filter, onChange } = this.props;
    const { value } = this.state;
    if (value === null) return;
    onChange({
      field: filter.field,
      label: filter.label,
      type: filter.type,
      value,
    });
  };

  // Refs
  // ==============================

  getFilterRef = ref => {
    if (!ref) return;
    this.filterRef = ref;
  };

  render() {
    const { filter, target } = this.props;
    const { value } = this.state;
    const { Filter } = FieldTypes[filter.field.list.key][filter.field.path];
    const headerTitle = filter.field.getFilterLabel(filter);

    return (
      <PopoutForm target={target} headerTitle={headerTitle} onSubmit={this.onSubmit} showFooter>
        {({ ref, recalcHeight }) => (
          <div ref={ref} style={{ padding: POPOUT_GUTTER }}>
            <Filter
              innerRef={this.getFilterRef}
              recalcHeight={recalcHeight}
              field={filter.field}
              filter={filter}
              onChange={this.onChangeFilter}
              value={value}
            />
          </div>
        )}
      </PopoutForm>
    );
  }
}
