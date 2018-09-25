import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import StarEmpty from './star-empty.svg';
import StarFull from './star-full.svg';

const StarInput = ({ num, value, onClick }) => {
  const Star = (value >= num) ? StarFull : StarEmpty;
  return <img src={Star} onClick={() => onClick(num)} />;
};

const StarWrapper = props => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: 5 * 22 + 5 * 4,
    }}
    {...props}
  />
);

export default class TextField extends Component {
  handleChange = (num) => {
    const { field, item, onChange } = this.props;
    const value = item[field.path];
    const newValue = value === num ? 0 : num;
    onChange(field, newValue);
  };

  render() {
    const { field, item } = this.props;
    const value = item[field.path];
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <StarWrapper>
            <StarInput num={1} value={value} onClick={this.handleChange} />
            <StarInput num={2} value={value} onClick={this.handleChange} />
            <StarInput num={3} value={value} onClick={this.handleChange} />
            <StarInput num={4} value={value} onClick={this.handleChange} />
            <StarInput num={5} value={value} onClick={this.handleChange} />
          </StarWrapper>
        </FieldInput>
      </FieldContainer>
    );
  }
}
