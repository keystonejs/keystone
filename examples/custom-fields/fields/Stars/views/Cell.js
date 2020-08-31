/** @jsx jsx */

import { jsx } from '@emotion/core';
import Stars from './Stars';

export default function StarsCell({ field, data }) {
  const { starCount } = field.config;
  return <Stars count={starCount} value={data} />;
}
