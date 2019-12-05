import * as React from 'react';
import { Link } from 'react-router-dom';

export const ItemElement = ({ as: Tag, isSelected, mouseIsOverNav, ...props }) => {
  if (Tag) return <Tag {...props} />;
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};
