import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { copyToClipboard as copy } from '../util';

const CopyToClipboard = forwardRef(
  ({ as: Tag, onClick, onError, onSuccess, text, ...rest }, ref) => {
    const handleClick = event => {
      // Attempt copy to clipboard
      copy(text, onSuccess, onError);

      // Maintain consumer on `onClick` if it exists
      if (onClick) {
        onClick(event);
      }
    };

    return <Tag ref={ref} onClick={handleClick} {...rest} />;
  }
);

CopyToClipboard.propTypes = {
  onError: PropTypes.func,
  onSuccess: PropTypes.func,
  text: PropTypes.string.isRequired,
};
CopyToClipboard.defaultProps = {
  as: 'div',
};

export default CopyToClipboard;
