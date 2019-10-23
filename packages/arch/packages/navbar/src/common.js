// @flow

import * as React from 'react';
import { Link } from 'react-router-dom';

type ItemProps = {
  isSelected?: boolean,
  mouseIsOverNav?: boolean,
  to?: string,
  href?: string,
  as?: string,
};

export const ItemElement = ({ as: Tag, isSelected, mouseIsOverNav, ...props }: ItemProps) => {
  if (Tag) return <Tag {...props} />;
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};
