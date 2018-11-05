import React, { PureComponent } from 'react';

import StarEmpty from './star-empty.svg';
import StarFull from './star-full.svg';
import StarWrapper from './StarWrapper';

type Props = {
  field: Object,
  list: Object,
  data: Object,
};

const Star = ({ num, value }) => {
  const icon = value >= num ? StarFull : StarEmpty;
  return <img src={icon} />;
};

export default class StarsCellView extends PureComponent<Props> {
  render() {
    const { field, data } = this.props;
    const { starCount } = field.config;
    return (
      <StarWrapper starCount={starCount}>
        {Array(starCount)
          .fill(true)
          .map((m, index) => (
            <Star key={index} num={index + 1} value={data} />
          ))}
      </StarWrapper>
    );
  }
}
