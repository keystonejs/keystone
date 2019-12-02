/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand, useMediaQuery } from '@westpac/core';

// ==============================
// Component
// ==============================

export const ChitChat = ({ tag: Tag, ...props }) => {
	const { COLORS, TYPE } = useBrand();
	const mq = useMediaQuery();

	return (
		<Tag
			css={mq({
				fontSize: '1.125rem',
				color: COLORS.heading,
				lineHeight: 1.4,
				textAlign: 'center',
				margin: [0, '0 0 1.875rem'],
				...TYPE.bodyFont[700],
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

ChitChat.propTypes = {
	/**
	 * Component tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

	/**
	 * Component text
	 */
	children: PropTypes.string.isRequired,
};

ChitChat.defaultProps = {
	tag: 'p',
};
