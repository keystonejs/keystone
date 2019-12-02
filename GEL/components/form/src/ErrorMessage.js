/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';
import shortid from 'shortid';

import { AlertIcon } from '@westpac/icon';

// ==============================
// Utility
// ==============================

export const ErrorMessageContent = ({ icon: Icon, children }) => (
	<>
		{Icon && (
			<Icon css={{ verticalAlign: 'top', marginRight: '0.25em' }} size="small" color="inherit" />
		)}
		{children}
	</>
);

// ==============================
// Component
// ==============================

export const ErrorMessage = ({ message, icon, tag: Tag, ...props }) => {
	const { COLORS } = useBrand();

	// Check for an array of messages
	const isMessages = Array.isArray(message);

	if (isMessages) {
		Tag = 'ul';
	}

	return (
		<Tag
			css={{
				fontSize: '0.875rem',
				margin: '0 0 0.75rem',
				color: COLORS.danger,
				...(isMessages && { listStyle: 'none', paddingLeft: 0 }),
			}}
			{...props}
		>
			{isMessages ? (
				message.map(msg => (
					<li css={{ marginBottom: '0.375rem' }} key={shortid.generate()}>
						<ErrorMessageContent icon={icon}>{msg}</ErrorMessageContent>
					</li>
				))
			) : (
				<ErrorMessageContent icon={icon}>{message}</ErrorMessageContent>
			)}
		</Tag>
	);
};

// ==============================
// Types
// ==============================

ErrorMessage.propTypes = {
	/**
	 * Error message item(s) text
	 */
	message: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),

	/**
	 * Error message item(s) icon
	 */
	icon: PropTypes.func,

	/**
	 * Component tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};

ErrorMessage.defaultProps = {
	message: 'Invalid input',
	icon: AlertIcon,
	tag: 'div',
};
