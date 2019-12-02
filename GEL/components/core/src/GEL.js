/** @jsx jsx */

import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

import { BrandContext } from './Brand';
import { useFocus } from './useFocus';
import { Core } from './Core';

export const GEL = ({ brand, children, ...props }) => {
	useFocus();

	return (
		<BrandContext.Provider value={brand} {...props}>
			<Core>{children}</Core>
		</BrandContext.Provider>
	);
};

GEL.propTypes = {
	// TODO `object` --> `shape`
	brand: PropTypes.oneOfType([
		PropTypes.shape({
			breakpoints: PropTypes.shape({
				sm: PropTypes.number,
				md: PropTypes.number,
				lg: PropTypes.number,
			}),
			colors: PropTypes.shape({
				background: PropTypes.string,
				border: PropTypes.string,
				borderDark: PropTypes.string,
				focus: PropTypes.string,
				heading: PropTypes.string,
				light: PropTypes.string,
				muted: PropTypes.string,
				neutral: PropTypes.string,
				text: PropTypes.string,

				// reserved
				success: PropTypes.string,
				information: PropTypes.string,
				warning: PropTypes.string,
				danger: PropTypes.string,

				// nested
				primary: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
				hero: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
				neutral: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
				faint: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
				success: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
				information: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
				warning: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
				danger: PropTypes.shape({
					default: PropTypes.string,
					foreground: PropTypes.string,
				}),
			}),
			type: PropTypes.object, // TODO
			spacing: PropTypes.object, // TODO
		}),
		PropTypes.func,
	]),
};
