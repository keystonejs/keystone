/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import Image from '../Image';

export const type = 'image';

export const ImageAlignmentContext = React.createContext({
  alignment: '',
  onAlignmentChange() {},
});

export function Node(props) {
  let { data } = props.node;
  let { alignment, onAlignmentChange } = React.useContext(ImageAlignmentContext);
  return (
    <Image
      alignment={alignment}
      attributes={props.attributes}
      isFocused={props.isFocused}
      src={data.get('src')}
      onAlignmentChange={onAlignmentChange}
    />
  );
}

export const getSchema = () => ({
  isVoid: true,
});
