/** @jsx jsx */

import { jsx } from '@westpac/core';
import { Select as SelectOrg } from '@westpac/text-input';
import PropTypes from 'prop-types';

// ==============================
// Component
// ==============================

export const Select = ({ position, size, data, ...props }) => (
	<SelectOrg
		size={size}
		data={data}
		css={{
			boxSizing: 'border-box',
			width: 'auto',
			marginLeft: position === 'right' && '-1px',
			marginRight: position === 'left' && '-1px',

			...(position === 'right' && {
				borderTopLeftRadius: 0,
				borderBottomLeftRadius: 0,
			}),
			...(position === 'left' && {
				borderTopRightRadius: 0,
				borderBottomRightRadius: 0,
			}),
		}}
		{...props}
	/>
);

Select.propTypes = {
	/**
	 * What position this component is at
	 */
	position: PropTypes.oneOf(['left', 'right']).isRequired,

	/**
	 * What size the button-group is
	 */
	size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']).isRequired,

	/**
	 * The content of the component
	 */
	data: PropTypes.array.isRequired,
};

Select.defaultProps = {
	size: 'medium',
};
