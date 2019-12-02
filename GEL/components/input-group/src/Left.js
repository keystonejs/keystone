/** @jsx jsx */

import { jsx, useBrand, merge } from '@westpac/core';
import PropTypes from 'prop-types';
import pkg from '../package.json';
import { Label } from './Label';
import { Button } from './Button';
import { Select } from './Select';

// ==============================
// Component
// ==============================

export const Left = ({ type, ...props }) => {
	const { [pkg.name]: overridesWithTokens } = useBrand();

	const overrides = {
		leftCSS: {},
		Label,
		Button,
		Select,
	};
	merge(overrides, overridesWithTokens);

	const componentMap = {
		label: overrides.Label,
		button: overrides.Button,
		select: overrides.Select,
	};
	const Component = componentMap[type];

	return <Component position="left" css={{ ...overrides.leftCSS }} {...props} />;
};

// ==============================
// Types
// ==============================

Left.propTypes = {
	/**
	 * What type this component is
	 */
	type: PropTypes.oneOf(['label', 'button', 'select']).isRequired,

	/**
	 * What size the button-group is
	 */
	size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']).isRequired,
};

Left.defaultProps = {
	size: 'medium',
};
