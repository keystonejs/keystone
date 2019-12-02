import React from 'react';
import PropTypes from 'prop-types';

/* 
 NOTE: This is only used by docz
 - There is currently a bug with <PropsTable /> in docz and components using React.portal where it doesnt read the props properly.
 - This is purely used for documentation purposes until the aforementioned bug is fixed. 

*/
export const ModalProps = () => <div />;

ModalProps.propTypes = {
	/** State of whether the modal is open */
	open: PropTypes.bool,
	/** Callback function for handling modal state */
	onClose: PropTypes.func,
	/** Size of the modal */
	size: PropTypes.oneOf(['small', 'medium', 'large']),
};

ModalProps.defaultProps = {
	open: false,
	size: 'medium',
};
