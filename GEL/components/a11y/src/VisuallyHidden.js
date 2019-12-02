/** @jsx jsx */

import { jsx, useBrand, merge } from '@westpac/core';
import PropTypes from 'prop-types';
import pkg from '../package.json';

// ==============================
// Component
// ==============================

// Only display content to screen readers
//
// See: https://a11yproject.com/posts/how-to-hide-content/
// See: https://hugogiraudel.com/2016/10/13/css-hide-and-seek/

export const VisuallyHidden = ({ tag: Tag, ...props }) => {
	const { [pkg.name]: brandOverrides } = useBrand();

	const overrides = {
		css: {},
	};
	merge(overrides, brandOverrides);

	return (
		<Tag
			css={{
				position: 'absolute',
				width: 1,
				height: 1,
				padding: 0,
				overflow: 'hidden',
				clip: 'rect(0, 0, 0, 0)',
				whiteSpace: 'nowrap',
				border: 0,
				...overrides.css,
			}}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

VisuallyHidden.propTypes = {
	/**
	 * Component tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,

	/**
	 * Component content
	 */
	children: PropTypes.node.isRequired,
};

VisuallyHidden.defaultProps = {
	tag: 'span',
};
