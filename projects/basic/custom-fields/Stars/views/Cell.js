import React from 'react';
import Stars from './Stars';

export default function StarsCell({ field, data }) {
  const { starCount } = field.config;
  return <Stars count={starCount} value={data} />;
}
