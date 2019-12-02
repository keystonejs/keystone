/** @jsx jsx */

import { jsx, useBrand, merge } from '@westpac/core';
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import pkg from '../package.json';
import { Item } from './Item';

// ==============================
// Context and Consumer Hook
// ==============================
const ListContext = createContext();

export const useListContext = () => useContext(ListContext);

// ==============================
// Component
// ==============================

export const List = ({ look, type, spacing, icon, data, children, ...props }) => {
	const { [pkg.name]: overridesWithTokens } = useBrand();

	const overrides = {
		Item,
		listCSS: {},
		css: {},
	};
	merge(overrides, overridesWithTokens);

	const context = useListContext();
	look = (context && context.look) || look;
	type = (context && context.type) || type;
	spacing = (context && context.spacing) || spacing;
	icon = (context && context.icon) || icon;

	const ListType = type === 'ordered' ? 'ol' : 'ul';

	return (
		<ListContext.Provider
			value={{
				look,
				type,
				spacing,
				icon,
			}}
		>
			<ListType
				css={{
					margin: 0,
					padding: type === 'ordered' ? '0 0 0 1.25rem' : 0,
				}}
				{...props}
			>
				{children}
			</ListType>
		</ListContext.Provider>
	);
};

// ==============================
// Types
// ==============================
List.propTypes = {
	/**
	 * The look of the bullet list
	 */
	look: PropTypes.oneOf(['primary', 'hero', 'neutral']).isRequired,

	/**
	 * The type of the bullet
	 */
	type: PropTypes.oneOf(['bullet', 'link', 'tick', 'unstyled', 'icon', 'ordered']).isRequired,

	/**
	 * The size of space between list elements
	 */
	size: PropTypes.oneOf(['medium', 'large']).isRequired,

	/**
	 * The icon for list
	 */
	icon: PropTypes.func,

	/**
	 * Any renderable child
	 */
	children: PropTypes.node,
};

List.defaultProps = {
	look: 'primary',
	type: 'bullet',
	size: 'medium',
};
