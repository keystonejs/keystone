// @flow

import React, { Component, Fragment, type Ref } from 'react';
import {
  OptionRenderer,
  Radio,
  RadioGroup,
  Select,
} from '@keystonejs/ui/src/primitives/filters';
import { gridSize } from '@keystonejs/ui/src/theme';

const EventCatcher = props => (
  <div
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
    {...props}
  />
);
const SelectWrapper = props => (
  <div css={{ marginTop: gridSize * 2 }} {...props} />
);

type Props = { field: Object, innerRef: Ref<*>, onChange: Event => void };
type State = { inverted: boolean };

export default class SelectFilterView extends Component<Props, State> {
  state = { inverted: this.props.value.inverted };
  handleRadioChange = value => {
    const { onChange, value: oldValue } = this.props;
    const inverted = value === 'does_match' ? false : true;
    onChange({ ...oldValue, inverted });
  };
  handleSelectChange = value => {
    const { onChange, value: oldValue } = this.props;
    const options = [].concat(value); // ensure consistent data shape
    onChange({ ...oldValue, options });
  };
  render() {
    const { innerRef, field, value } = this.props;

    const radioValue = value.inverted ? 'does_not_match' : 'does_match';
    const selectProps = {
      innerRef: innerRef,
      onChange: this.handleSelectChange,
      options: field.options,
      placeholder: 'Select...',
      value: value.options,
    };

    return (
      <Fragment>
        <RadioGroup onChange={this.handleRadioChange} value={radioValue}>
          <Radio value="does_match">Matches</Radio>
          <Radio value="does_not_match">Does not match</Radio>
        </RadioGroup>
        <SelectWrapper>
          {field.options.length > 8 ? (
            <EventCatcher>
              <Select menuPortalTarget={document.body} {...selectProps} />
            </EventCatcher>
          ) : (
            <OptionRenderer displaySearch={false} {...selectProps} />
          )}
        </SelectWrapper>
      </Fragment>
    );
  }
}
