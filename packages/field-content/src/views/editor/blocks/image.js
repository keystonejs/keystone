/** @jsx jsx */
import { jsx } from '@emotion/core';
import { createContext, useContext } from 'react';
import { useFocused } from 'slate-react';

import Image from '../Image';

export const type = 'image';

export const ImageAlignmentContext = createContext({
  alignment: '',
  onAlignmentChange: () => {},
});

export const Node = ({ element: { src }, attributes }) => {
  const isFocused = useFocused();
  const { alignment, onAlignmentChange } = useContext(ImageAlignmentContext);

  return (
    <Image
      alignment={alignment}
      attributes={attributes}
      isFocused={isFocused}
      src={src}
      onAlignmentChange={onAlignmentChange}
    />
  );
};

export const getPlugin = () => editor => {
  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.type === type ? true : isVoid(element);
  };

  return editor;
};
