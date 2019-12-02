/** @jsx jsx */

import { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand, useMediaQuery, merge, wrapHandlers, asArray } from '@westpac/core';
import { VisuallyHidden } from '@westpac/a11y';
import pkg from '../package.json';

// ==============================
// Utils
// ==============================
const sizeMap = {
	small: {
		width: '4.375rem',
		height: '1.875rem',
		borderRadius: '1.875rem',
		fontSize: '0.875rem',
	},
	medium: {
		width: '5rem',
		height: '2.25rem',
		borderRadius: '2.25rem',
		fontSize: '1rem',
	},
	large: {
		width: '5.5625rem',
		height: '2.625rem',
		borderRadius: '2.625rem',
		fontSize: '1rem',
	},
	xlarge: {
		width: '6rem',
		height: '3rem',
		borderRadius: '3rem',
		fontSize: '1.125rem',
	},
};

const responsiveMap = size => ({
	width: size.map(s => s && sizeMap[s].width),
	height: size.map(s => s && sizeMap[s].height),
	borderRadius: size.map(s => s && sizeMap[s].borderRadius),
	fontSize: size.map(s => s && sizeMap[s].fontSize),
});

// ==============================
// Component
// ==============================
export const Switch = ({
	name,
	label,
	checked: isChecked,
	onChange,
	size,
	block,
	flipped,
	toggleText,
	disabled,
	srOnlyText,
	...props
}) => {
	const { COLORS, [pkg.name]: overridesWithTokens } = useBrand();
	const mq = useMediaQuery();
	const [checked, setChecked] = useState(isChecked);
	const sizeArr = responsiveMap(asArray(size));

	const overrides = {
		toggleCSS: {},
		toggleTextCSS: {},
		CSS: {},
		Label,
		ToggleTextWrapper,
	};

	merge(overrides, overridesWithTokens);

	useEffect(() => {
		setChecked(isChecked);
	}, [isChecked]);

	const handleChange = () => wrapHandlers(onChange, () => setChecked(!checked));

	return (
		<label
			css={mq({
				display: block ? 'flex' : 'inline-flex',
				opacity: disabled && 0.5,
				width: block && '100%',
				flexWrap: 'wrap',
				alignItems: 'center',
				position: 'relative',
				marginRight: !block && '1.125rem',
				height: !block && sizeArr.height,
				marginBottom: '0.375rem',
				flexDirection: flipped && 'row-reverse',
				cursor: disabled ? 'not-allowed' : 'pointer',
				...overrides.CSS,
			})}
			{...props}
		>
			<input
				type="checkbox"
				name={name}
				checked={checked}
				onChange={handleChange(name)}
				disabled={disabled}
				css={{
					position: 'absolute',
					zIndex: '-1',
					opacity: 0,
				}}
			/>
			<overrides.Label block={block} flipped={flipped}>
				{srOnlyText ? <VisuallyHidden>{label}</VisuallyHidden> : label}
			</overrides.Label>
			<span
				css={mq({
					display: 'block',
					position: 'relative',
					border: `2px solid ${checked ? COLORS.hero : COLORS.border}`,
					borderRadius: sizeArr.borderRadius,
					backgroundColor: checked ? COLORS.hero : '#fff',
					height: sizeArr.height,
					width: sizeArr.width,
					overflow: 'hidden',
					lineHeight: 1.5,
					transition: 'border .3s ease,background .3s ease',

					// the thumb/dot
					'::after': {
						content: '""',
						height: sizeArr.height,
						width: sizeArr.height,
						display: 'block',
						position: 'absolute',
						left: checked ? '100%' : 0,
						transform: checked ? 'translateX(-100%)' : null,
						top: 0,
						borderRadius: '50%',
						backgroundColor: '#fff',
						boxShadow: '3px 0 6px 0 rgba(0,0,0,0.3)',
						transition: 'all .3s ease',
					},
					...overrides.toggleCSS,
				})}
			>
				{!!toggleText && (
					<overrides.ToggleTextWrapper>
						<ToggleText
							position={'left'}
							checked={checked}
							size={sizeArr}
							css={overrides.toggleTextCSS}
						>
							{toggleText[0]}
						</ToggleText>
						<ToggleText
							position={'right'}
							checked={!checked}
							size={sizeArr}
							css={overrides.toggleTextCSS}
						>
							{toggleText[1]}
						</ToggleText>
					</overrides.ToggleTextWrapper>
				)}
			</span>
		</label>
	);
};

// ==============================
// Types
// ==============================

const options = {
	size: ['small', 'medium', 'large', 'xlarge'],
};

Switch.propTypes = {
	/**
	 * Switch input element name
	 */
	name: PropTypes.string,

	/**
	 * On/off text.
	 *
	 * This prop takes an array where the first index is the "on" text and second index is the "off" text e.g. "['Yes', 'No']"
	 */
	toggleText: PropTypes.arrayOf(PropTypes.string),

	/**
	 * Switch size
	 */
	size: PropTypes.oneOfType([
		PropTypes.oneOf(options.size),
		PropTypes.arrayOf(PropTypes.oneOf(options.size)),
	]),

	/**
	 * Block mode
	 */
	block: PropTypes.bool,

	/**
	 * Reverse the horizontal orientation. Renders the toggle on the left of the label text.
	 */
	flipped: PropTypes.bool,

	/**
	 * Enable ‘screen reader only’ label text mode.
	 */
	srOnlyText: PropTypes.bool,

	/**
	 * Switch on/off state
	 */
	checked: PropTypes.bool,

	/**
	 * Disable the switch
	 */
	disabled: PropTypes.bool,

	/**
	 * The onChange handler for this switch
	 */
	onChange: PropTypes.func,
};

Switch.defaultProps = {
	size: 'medium',
	checked: false,
	toggleText: ['On', 'Off'],
};

// ==============================
// Styled/Token Components
// ==============================
const Label = ({ block, flipped, ...props }) => (
	<span
		css={{
			flex: block && 1,
			display: 'flex',
			alignItems: 'center',
			whiteSpace: 'normal',
			position: 'relative',
			[flipped ? 'paddingLeft' : 'paddingRight']: '0.375rem',
		}}
		{...props}
	/>
);

const ToggleText = ({ position, checked, size, ...props }) => {
	const { COLORS } = useBrand();
	const mq = useMediaQuery();

	return (
		<span
			css={mq({
				position: 'absolute',
				[position]: 0,
				transition: 'opacity .3s ease',
				opacity: checked ? 1 : 0,
				width: size.height,
				lineHeight: size.height,
				fontSize: size.fontSize,
				paddingLeft: '0.25rem',
				paddingRight: '0.25rem',
				color: position === 'right' ? COLORS.neutral : '#fff',
				textAlign: 'center',
			})}
			{...props}
		/>
	);
};

const ToggleTextWrapper = ({ children }) => <Fragment>{children}</Fragment>;
