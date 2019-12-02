/** @jsx jsx */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';

// ==============================
// Context and consumer hook
// ==============================

const PanelContext = createContext();

export const usePanelContext = () => {
	const context = useContext(PanelContext);
	if (!context) {
		throw new Error('Panel children should be wrapped in a <Panel>.');
	}
	return context;
};

// ==============================
// Component
// ==============================

export const Panel = ({ appearance, ...props }) => {
	const { COLORS } = useBrand();

	const appearanceMap = {
		hero: {
			borderColor: COLORS.hero,
		},
		faint: {
			borderColor: COLORS.border,
		},
	};

	const common = {
		marginBottom: '1.3125rem',
		backgroundColor: '#fff',
		border: `1px solid ${appearanceMap[appearance].borderColor}`,
		borderRadius: '0.1875rem',
		table: {
			overflow: 'hidden', //clip overflow for rounded corners
			marginBottom: 0,
			borderBottomRightRadius: `calc(0.1875rem - 1px)`,
			borderBottomLeftRadius: `calc(0.1875rem - 1px)`,
		},
		'table caption': {
			padding: ['0.75rem 0.75rem 0 0.75rem', '1.5rem 1.5rem 0 1.5rem'],
		},
	};

	return (
		<PanelContext.Provider value={{ appearance }}>
			<div css={common} {...props} />
		</PanelContext.Provider>
	);
};

// ==============================
// Types
// ==============================

const options = {
	appearance: ['hero', 'faint'],
};

export const propTypes = {
	/**
	 * Panel appearance
	 */
	appearance: PropTypes.oneOf(options.appearance),

	/**
	 * Panel content
	 */
	children: PropTypes.node,
};

export const defaultProps = {
	appearance: 'hero',
};

Panel.propTypes = propTypes;
Panel.defaultProps = defaultProps;
