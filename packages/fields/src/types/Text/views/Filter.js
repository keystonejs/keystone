// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import { Input } from '@arch-ui/input';
import type { FilterProps } from '../../../types';
import { FieldContainer } from '@arch-ui/fields';
import { gridSize } from '@arch-ui/theme';

type Props = FilterProps<string>;

type State = { isSensesitive: boolean };

export default class TextFilterView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isSensesitive: this.props.field.getFilterSensitive() };
  }

  handleChange = ({ target: { value } }: Object) => {
    this.props.onChange(value);
  };

  checkboxOnChange = ({ target: { checked } }: Object) => {
    this.setState({ isSensesitive: checked });
    this.props.field.setFilterSensitive(checked);
  };

  render() {
    const { filter, field, innerRef, value } = this.props;
    const { isSensesitive } = this.state;
    if (!filter) return null;

    const placeholder = field.getFilterLabel(filter);

    return (
      <FieldContainer>
        <Input
          onChange={this.handleChange}
          ref={innerRef}
          placeholder={placeholder}
          value={value}
        />
        <div
          css={{
            display: 'flex',
            marginTop: gridSize,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <input
            type="checkbox"
            autoFocus={false}
            checked={isSensesitive}
            onChange={this.checkboxOnChange}
          />
          <label>Sensitive</label>
        </div>
      </FieldContainer>
    );
  }
}
