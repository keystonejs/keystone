/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useMediaQuery } from '@westpac/core';
import { FormPodActionsPrimary, FormPodActionsSecondary } from './styled';

// ==============================
// Component
// ==============================

export const FormPodActions = ({ primary, secondary, reverse, ...props }) => {
	const mq = useMediaQuery();

	const children = [
		<FormPodActionsPrimary key="primary">{primary}</FormPodActionsPrimary>,
		<FormPodActionsSecondary key="secondary">{secondary}</FormPodActionsSecondary>,
	];

	return (
		<div
			css={mq({
				display: [null, 'flex'],
				flexDirection: !reverse && [null, 'row-reverse'],
				marginTop: '1.875rem',

				'button + button': {
					marginLeft: ['0.75rem', '0.5rem'], //gap
				},
			})}
			{...props}
		>
			{reverse ? children.reverse() : children}
		</div>
	);
};

// ==============================
// Types
// ==============================

FormPodActions.propTypes = {
	/**
	 * Primary 'slot'.
	 *
	 * The primary slot is on the right hand side for MD+ breakpoints.
	 */
	primary: PropTypes.node,

	/**
	 * Secondary 'slot'.
	 *
	 * The secondary slot is on the left hand side for MD+ breakpoints.
	 */
	secondary: PropTypes.node,

	/**
	 * Reverse layout mode.
	 *
	 * Will swap primary and secondary slot order in the DOM (refer to XS breakpoint).
	 */
	reverse: PropTypes.bool,
};

FormPodActions.defaultProps = {
	reverse: false,
};
