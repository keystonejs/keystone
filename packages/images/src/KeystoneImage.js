import React from 'react';

const KeystoneImage = ({ src, width, height, fit, ...props }) => {
  const query = [];
  if (width) query.push('width=' + width);
  if (height) query.push('height=' + height);
  if (fit) query.push('fit=' + fit);
  const transformSrc = query.length ? `${src}?${query.join('&')}` : src;
  return <img src={transformSrc} {...props} />;
};

export default KeystoneImage;
