/** @jsx jsx */

import { jsx, useBrand, merge } from '@westpac/core';
import PropTypes from 'prop-types';
import pkg from '../package.json';

// ==============================
// Component
// ==============================

/**
 * Body: Body component in charge of body text
 */
export const Body = ({ children, ...props }) => {
	const { COLORS, TYPE, [pkg.name]: brandOverrides } = useBrand();

	const overrides = {
		css: {},
	};
	merge(overrides, brandOverrides);

	return (
		<div
			css={{
				'h1, h2, h3, h4, h5, h6': {
					color: COLORS.heading,
				},

				p: {
					margin: '0.75rem 0',
				},

				dt: {
					...TYPE.bodyFont[700],
				},
				dd: {
					margin: 0,
				},

				'abbr[title]': {
					cursor: 'help',
					borderBottom: `1px dotted ${COLORS.text}`,
					textDecoration: 'none',
				},

				address: {
					fontStyle: 'normal',
				},

				blockquote: {
					fontSize: '1rem',
					...TYPE.bodyFont[300],
				},

				mark: {
					backgroundColor: COLORS.tints.primary20,
				},

				a: {
					color: COLORS.primary,
					textDecoration: 'underline',

					':hover': {
						textDecoration: 'underline',
					},
				},
				...(props[atob('d3JpdHRlbmJ5')]
					? {
							'&:after': {
								content: '""',
								background:
									'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHZpZXdCb3g9IjAgMCA4MjUgMTgiPjx0ZXh0IHg9IjEzIiB5PSIxMyIgZm9udC1zaXplPSIxNiI+RG9taW5payBXaWxrb3dza2ksIEp1c3RpbiBTcGVuY2VyLCBKb25ueSBTdGVuaW5nLCBLYXRlIFQgTWFjRG9uYWxkLCBNYXJpdGEgQ2F0aGVyaW5lIFB1cmlucywgSmVyZW15IE9ydGl6LCBGbG9yZSBMYWZvcmdlPC90ZXh0Pjwvc3ZnPg==") no-repeat',
								display: 'block',
								height: '1em',
							},
					  }
					: {}),
				...overrides.css,
			}}
			{...props}
		>
			{children}
		</div>
	);
};

// ==============================
// Types
// ==============================

Body.propTypes = {
	children: PropTypes.node.isRequired,
};

Body.defaultProps = {};
