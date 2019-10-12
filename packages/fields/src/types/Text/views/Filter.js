// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import { Input } from '@arch-ui/input';
import type { FilterProps } from '../../../types';
import { FieldContainer } from '@arch-ui/fields';
import { gridSize } from '@arch-ui/theme';

type Props = FilterProps<string>;

type State = { isInsesitive: boolean };

export default class TextFilterView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isInsesitive: this.props.field.getFilterInsensitive() };
  }

  handleChange = ({ target: { value } }: Object) => {
    this.props.onChange(value);
  };

  checkboxOnChange = ({ target: { checked } }: Object) => {
    this.setState({ isInsesitive: checked });
    this.props.field.setFilterInsensitive(checked);
  };

  render() {
    const { filter, field, innerRef, value } = this.props;
    const { isInsesitive } = this.state;
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
            checked={isInsesitive}
            onChange={this.checkboxOnChange}
          />
          <label>Insensitive</label>
        </div>
      </FieldContainer>
    );
  }
}
