/** @jsx jsx */

import { jsx, useBrand, useMediaQuery, asArray, merge } from '@westpac/core';
import PropTypes from 'prop-types';

import { Content } from './Content';
import pkg from '../package.json';

// ==============================
// Component
// ==============================

export const Button = ({
	look,
	size,
	soft,
	block,
	iconAfter,
	iconBefore,
	justify,
	disabled,
	srOnlyText,
	tag: Tag,
	onClick,
	children,
	...props
}) => {
	const { COLORS, TYPE, [pkg.name]: overridesWithTokens } = useBrand();
	const mq = useMediaQuery();

	// We don't support soft links, so don't want them to cause styling issues
	if (soft && look === 'link') soft = false;

	const bg = {
		background:
			'linear-gradient(to bottom,rgb(255, 62, 24) 16.66666666666667%,rgb(252, 154, 0) 16.66666666666667%,rgb(252, 154, 0) 33.33333333333333%,rgb(255, 216, 0) 33.33333333333333%,rgb(255, 216, 0) 33.33333333333333%,rgb(255, 216, 0) 50.00000000000001%,rgb(57, 234, 124) 50.00000000000001%,rgb(57, 234, 124) 66.66666666666668%,rgb(11, 178, 255) 66.66666666666668%,rgb(11, 178, 255) 83.33333333333335%,rgb(152, 90, 255) 83.33333333333335%)',
		color: COLORS.text,
	};

	// Appearance styling
	const overrides = {
		primary: {
			standardCSS: {
				color: '#fff',
				backgroundColor: COLORS.primary,
				borderColor: COLORS.primary,

				':hover': {
					backgroundColor: COLORS.tints.primary70,
				},
				':active, &.active': {
					backgroundColor: COLORS.tints.primary50,
				},
			},
			softCSS: {
				color: COLORS.text,
				backgroundColor: '#fff',
				borderColor: COLORS.primary,

				':hover': {
					color: '#fff',
					backgroundColor: COLORS.tints.primary70,
				},
				':active, &.active': {
					color: '#fff',
					backgroundColor: COLORS.tints.primary50,
				},
			},
		},
		hero: {
			standardCSS: {
				color: '#fff', //TODO: STG uses `COLORS.text`
				backgroundColor: COLORS.hero,
				borderColor: COLORS.hero,

				':hover': {
					backgroundColor: COLORS.tints.hero70,
				},
				':active, &.active': {
					backgroundColor: COLORS.tints.hero50,
				},
			},
			softCSS: {
				color: COLORS.text,
				backgroundColor: '#fff',
				borderColor: COLORS.hero,

				':hover': {
					color: '#fff', //TODO: STG uses `COLORS.text` (i.e. `color: null`)
					backgroundColor: COLORS.tints.hero70,
				},
				':active, &.active': {
					color: '#fff', //TODO: STG uses `COLORS.text` (i.e. `color: null`)
					backgroundColor: COLORS.tints.hero50,
				},
			},
		},
		faint: {
			standardCSS: {
				color: COLORS.muted,
				backgroundColor: COLORS.light,
				borderColor: COLORS.border,

				':hover, :active, &.active': {
					backgroundColor: '#fff',
				},
			},
			softCSS: {
				color: COLORS.muted,
				backgroundColor: '#fff',
				borderColor: COLORS.border,

				':hover, :active, &.active': {
					backgroundColor: COLORS.light,
				},
			},
		},
		link: {
			standardCSS: {
				color: COLORS.primary,
				backgroundColor: 'transparent',
				borderColor: 'transparent',
			},
		},
		[atob('cHJpZGU=')]: {
			standardCSS: { ...bg },
			soft: { ...bg },
		},
		Content,
	};
	merge(overrides, overridesWithTokens);

	// Size styling (responsive)
	const sizeArr = asArray(size);

	const sizeMap = {
		small: {
			padding: ['0.1875rem', '0.5625rem', '0.25rem'],
			fontSize: '0.875rem',
			height: '1.875rem',
		},
		medium: {
			padding: ['0.3125rem', '0.75rem'],
			fontSize: '1rem',
			height: '2.25rem',
		},
		large: {
			padding: ['0.5rem', '0.9375rem'],
			fontSize: '1rem',
			height: '2.625rem',
		},
		xlarge: {
			padding: ['0.5625rem', '1.125rem', '0.625rem'],
			fontSize: '1.125rem',
			height: '3rem',
		},
	};

	// Block styling (responsive)
	const blockArr = asArray(block);

	if (props.href) {
		Tag = 'a';
	}

	return (
		<Tag
			type={Tag === 'button' && props.onClick ? 'button' : undefined}
			disabled={disabled}
			css={mq({
				alignItems: 'center', //vertical
				appearance: 'none',
				border: '1px solid transparent',
				borderRadius: '0.1875rem',
				cursor: 'pointer',
				justifyContent: justify ? 'space-between' : 'center', //horizontal
				lineHeight: 1.5,
				textAlign: 'center',
				textDecoration: 'none',
				touchAction: 'manipulation',
				transition: 'background 0.2s ease, color 0.2s ease',
				userSelect: 'none',
				verticalAlign: look === 'link' ? 'baseline' : 'middle',
				whiteSpace: 'nowrap',
				boxSizing: 'border-box',
				...TYPE.bodyFont[400],

				// Hover state (but excluded if disabled or inside a disabled fieldset)
				':hover:not(:disabled), fieldset:not(:disabled) &:hover': {
					textDecoration: look === 'link' ? 'underline' : 'none',
				},

				// Disabled via `disabled` attribute or inside a disabled fieldset
				':disabled, fieldset:disabled &': {
					opacity: '0.5',
					pointerEvents: 'none',
				},
				padding: sizeArr.map(s => {
					if (!s) return null;
					let p = [...sizeMap[s].padding];
					if (look === 'link') {
						p = ['0'];
					}

					return p.join(' ');
				}),
				fontSize: sizeArr.map(s => s && sizeMap[s].fontSize),
				height: sizeArr.map(s => {
					if (!s) return null;
					if (look === 'link') {
						return null;
					}
					return sizeMap[s].height;
				}),
				...overrides[look][soft ? 'softCSS' : 'standardCSS'],
				display: blockArr.map(b => b !== null && (b ? 'flex' : 'inline-flex')),
				width: blockArr.map(b => b !== null && (b ? '100%' : 'auto')),
			})}
			onClick={onClick}
			{...props}
		>
			{/* `<input>` elements cannot have children; they would use a `value` prop) */}
			{Tag !== 'input' ? (
				<overrides.Content
					size={size}
					block={block}
					iconAfter={iconAfter}
					iconBefore={iconBefore}
					srOnlyText={srOnlyText}
				>
					{children}
				</overrides.Content>
			) : null}
		</Tag>
	);
};

// ==============================
// Types
// ==============================

Button.propTypes = {
	/**
	 * Button look
	 */
	look: PropTypes.oneOf(['primary', 'hero', 'faint', 'link']),

	/**
	 * Button size
	 */
	size: PropTypes.oneOfType([
		PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
		PropTypes.arrayOf(PropTypes.oneOf(['small', 'medium', 'large', 'xlarge'])),
	]),

	/**
	 * Button tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

	/**
	 * Soft mode.
	 *
	 * Removes background colour and adjusts text colour.
	 */
	soft: PropTypes.bool,

	/**
	 * Button disabled
	 */
	disabled: PropTypes.bool.isRequired,

	/**
	 * Block mode.
	 *
	 * Fit button width to its parent width.
	 */
	block: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.bool)]),

	/**
	 * Places an icon within the button, after the button’s text
	 */
	iconAfter: PropTypes.func,

	/**
	 * Places an icon within the button, before the button’s text
	 */
	iconBefore: PropTypes.func,

	/**
	 * Justify align button children
	 */
	justify: PropTypes.bool,

	/**
	 * Enable ‘screen reader only’ text mode
	 */
	srOnlyText: PropTypes.bool,

	/**
	 * Handler to be called on click
	 */
	onClick: PropTypes.func,

	/**
	 * Button text
	 */
	children: PropTypes.node,
};

Button.defaultProps = {
	look: 'primary',
	size: 'medium',
	tag: 'button',
	soft: false,
	block: false,
	justify: false,
	disabled: false,
};
