import React, { Component } from 'react';

import { POPOUT_GUTTER } from '../../../components/Popout';
import PopoutForm from './PopoutForm';

export default class EditFilterPopout extends Component {
  state = { value: this.props.filter.value };

  onChangeFilter = value => {
    this.setState({ value });
  };
  onSubmit = () => {
    const { filter, onChange } = this.props;
    const { value } = this.state;
    if (value === null || filter.field.getFilterValue(value) === null) return;
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
    let [Filter] = filter.field.readViews([filter.field.views.Filter]);
    const headerTitle = filter.field.getFilterLabel(filter);

    return (
      <PopoutForm target={target} headerTitle={headerTitle} onSubmit={this.onSubmit} showFooter>
        {({ ref }) => (
          <div ref={ref} style={{ padding: POPOUT_GUTTER }}>
            <Filter
              innerRef={this.getFilterRef}
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
