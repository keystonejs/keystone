// @flow

import React from 'react';
import { Link } from 'react-router-dom';

type ItemProps = { isSelected?: boolean, to?: string, href?: string };

export const ItemElement = ({ isSelected, ...props }: ItemProps) => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};
