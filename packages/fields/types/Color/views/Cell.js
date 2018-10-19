import * as React from 'react';
import isColor from 'is-color';

const Cell = props => {
  if (!props.data) {
    return null;
  }

  // checking if it's a valid CSS color since otherwise it could insert arbitrary CSS
  if (!isColor(props.data)) {
    return props.data;
  }

  return (
    <React.Fragment>
      <div
        css={{
          backgroundColor: props.data,
          borderRadius: 3,
          display: 'inline-block',
          height: 18,
          width: 18,
          marginRight: 10,
          verticalAlign: 'middle',
        }}
      />
      <span
        css={{
          verticalAlign: 'middle',
        }}
      >
        {props.data}
      </span>
    </React.Fragment>
  );
};

export default Cell;
