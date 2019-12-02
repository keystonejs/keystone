/** @jsx jsx */

import { jsx } from '@westpac/core';
import { Button as ButtonOr } from '@westpac/button';
import PropTypes from 'prop-types';

// ==============================
// Component
// ==============================

export const Button = ({ position, size, data, ...props }) => (
	<ButtonOr
		size={size}
		css={{
			boxSizing: 'border-box',
			borderRight: position === 'left' && 0,
			borderLeft: position === 'right' && 0,

			...(!(position === 'left') && {
				borderTopLeftRadius: 0,
				borderBottomLeftRadius: 0,
			}),
			...(!(position === 'right') && {
				borderTopRightRadius: 0,
				borderBottomRightRadius: 0,
			}),
		}}
		{...props}
	>
		{data}
	</ButtonOr>
);

Button.propTypes = {
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
	data: PropTypes.string.isRequired,
};

Button.defaultProps = {
	look: 'hero', // button look to be spread to Button
	size: 'medium',
};
