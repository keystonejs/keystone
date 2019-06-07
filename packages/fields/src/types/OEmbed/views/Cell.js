import * as React from 'react';

const Cell = (props: Props) => {
  let { data } = props;

  if (!data) {
    return null;
  }

  return <a href={data}>{JSON.stringify(data, null, 2)}</a>;
};

export default Cell;
