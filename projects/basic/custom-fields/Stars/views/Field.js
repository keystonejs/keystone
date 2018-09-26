import React, { PureComponent } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import StarEmpty from './star-empty.svg';
import StarFull from './star-full.svg';
import StarWrapper from './StarWrapper';

const StarInput = ({ num, value, onClick }) => {
  const Star = value >= num ? StarFull : StarEmpty;
  return <img src={Star} onClick={() => onClick(num)} />;
};

export default class TextField extends PureComponent {
  handleChange = (num) => {
    const { field, item, onChange } = this.props;
    const value = item[field.path];
    const newValue = value === num ? 0 : num;
    onChange(field, newValue);
  };

  render() {
    const { field, item } = this.props;
    const { starCount } = field.config;
    const value = item[field.path];
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <StarWrapper starCount={starCount}>
            {Array(starCount).fill(true).map((v, index) => (
              <StarInput
                key={index}
                num={index + 1}
                value={value}
                onClick={this.handleChange}
              />
            ))}
          </StarWrapper>
        </FieldInput>
      </FieldContainer>
    );
  }
}
