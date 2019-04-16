// @flow
import * as React from 'react';
import { Button } from '@arch-ui/button';

import type { OnChangeType } from './types';

type PageProps = {
  children?: React.Node,
  isDisabled?: boolean,
  isSelected?: boolean,
  onClick: OnChangeType,
  value: number,
};

const Page = (props: PageProps) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick(props.value);
    }
  };

  return <Button {...props} onClick={handleClick} />;
};

export default Page;
