import React, { Component } from 'react';

import StarEmpty from './star-empty.svg';
import StarFull from './star-full.svg';

type Props = {
  field: Object,
  list: Object,
  data: Object,
};

const Star = ({ num, value }) => {
  const icon = value >= num ? StarFull : StarEmpty;
  return <img src={icon} />;
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

export default class StarsCellView extends Component<Props> {
  render() {
    const { data } = this.props;
    return (
      <StarWrapper>
        <Star num={1} value={data} />
        <Star num={2} value={data} />
        <Star num={3} value={data} />
        <Star num={4} value={data} />
        <Star num={5} value={data} />
      </StarWrapper>
    );
  }
}
