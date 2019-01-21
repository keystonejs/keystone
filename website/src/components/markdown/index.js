import React from 'react';
import { Link } from 'gatsby';
import Heading from './Heading';
import Code from './Code';

export default {
  h1: props => <Heading {...props} tag="h1" />,
  h2: props => <Heading {...props} tag="h2" />,
  h3: props => <Heading {...props} tag="h3" />,
  h4: props => <Heading {...props} tag="h4" />,
  h5: props => <Heading {...props} tag="h5" />,
  h6: props => <Heading {...props} tag="h6" />,
  code: Code,
  a: ({ href, ...props }) => {
    if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0) {
      return <a href={href} {...props} />;
    }
    return <Link to={href} {...props} />;
  },
};
