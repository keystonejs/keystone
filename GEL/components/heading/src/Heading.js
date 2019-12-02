/** @jsx jsx */

import { jsx, useBrand } from '@westpac/core';
import PropTypes from 'prop-types';

// ==============================
// Component
// ==============================

/**
 * Heading: Headlines for your page needs
 */
export const Heading = ({ tag: Tag, size, children, ...props }) => {
	const { PACKS } = useBrand();

	// ignore all non h1-h6 tags
	if (Tag && !Tag.startsWith('h') && !(Tag.length === 2)) {
		Tag = null;
	}

	// fall back to size = semantic if no tag is given
	if (!Tag) {
		if (size > 6) {
			Tag = 'h6';
		} else if (size < 1) {
			Tag = 'h1';
		} else {
			Tag = `h${size}`;
		}
	}

	return (
		<Tag
			css={{
				margin: 0,
				...PACKS.headline[size],
			}}
			{...props}
		>
			{children}
		</Tag>
	);
};

// ==============================
// Types
// ==============================

Heading.propTypes = {
	/**
	 * Component tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])]),

	/**
	 * The visual size of the headline
	 */
	size: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9]).isRequired,
};

Heading.defaultProps = {};
