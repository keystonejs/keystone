/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { jsx, useBrand } from '@westpac/core';
import { useFormCheckContext } from './FormCheck';

// ==============================
// Component
// ==============================

export const FormCheckOption = ({ value, checked, disabled, onChange, children, ...props }) => {
	const { COLORS } = useBrand();
	const { type, name, size, inline, flipped } = useFormCheckContext();

	const [isChecked, setChecked] = useState(checked);
	const [formCheckId] = useState(`formCheck-${shortid.generate()}`);

	useEffect(() => {
		setChecked(isChecked);
	}, [isChecked]);

	const toggle = () => {
		if (onChange) {
			onChange();
		} else {
			setChecked(!isChecked);
		}
	};

	const sizeMap = {
		medium: {
			control: {
				width: '1.5rem',
			},
			check: {
				checkbox: {
					width: '0.875rem',
					height: '0.5rem',
					stroke: '0.1875rem',
					tweak: '-0.125rem',
				},
				radio: {
					width: '0.75rem',
					height: '0.75rem',
					tweak: '0rem',
				},
			},
			option: {
				marginRight: '1.125rem',
				marginBottom: '0.375rem',
			},
			label: {
				paddingTop: '0.125rem',
				paddingBottom: '0.125rem',
				gap: '0.375rem',
			},
		},
		large: {
			control: {
				width: '1.875rem',
			},
			check: {
				checkbox: {
					width: '1.125rem',
					height: '0.625rem',
					stroke: '0.25rem',
					tweak: '-0.125rem',
				},
				radio: {
					width: '1rem',
					height: '1rem',
					tweak: '0rem',
				},
			},
			option: {
				marginRight: '1.125rem',
				marginBottom: '0.75rem',
			},
			label: {
				paddingTop: '0.3125rem',
				paddingBottom: '0.3125rem',
				gap: '0.625rem',
			},
		},
	};

	const controlWidth = sizeMap[size].control.width;
	const controlHeight = sizeMap[size].control.width;
	const checkWidth = sizeMap[size].check[type].width;
	const checkHeight = sizeMap[size].check[type].height;
	const checkTweak = sizeMap[size].check[type].tweak;

	const checkboxStroke = sizeMap[size].check['checkbox'].stroke;

	return (
		<div
			css={{
				position: 'relative',
				display: inline ? 'inline-block' : 'block',
				verticalAlign: inline && 'top',
				marginRight: inline && sizeMap[size].option.marginRight,
				marginBottom: sizeMap[size].option.marginBottom,
				minHeight: controlHeight,
				[flipped ? 'paddingRight' : 'paddingLeft']: controlWidth,
			}}
			{...props}
		>
			<input
				type={type}
				css={{
					position: 'absolute',
					zIndex: 1,
					top: 0,
					[flipped ? 'right' : 'left']: 0,
					width: controlWidth,
					height: controlHeight,
					cursor: 'pointer',
					margin: 0,
					opacity: 0, //hide

					':disabled, fieldset:disabled &': {
						cursor: 'default',
					},
				}}
				name={name}
				id={formCheckId}
				value={value}
				checked={isChecked}
				disabled={disabled}
				onChange={toggle}
			/>
			<label
				htmlFor={formCheckId}
				css={{
					display: 'inline-block',
					paddingTop: sizeMap[size].label.paddingTop,
					paddingBottom: sizeMap[size].label.paddingBottom,
					[flipped ? 'paddingRight' : 'paddingLeft']: sizeMap[size].label.gap,
					marginBottom: 0,
					cursor: 'pointer',
					touchAction: 'manipulation', // remove 300ms pause on mobile

					// Disabled state
					'input:disabled + &, fieldset:disabled &': {
						cursor: 'default',
						color: COLORS.muted,
					},

					// Control outline
					'::before': {
						content: '""',
						boxSizing: 'border-box',
						position: 'absolute',
						top: 0,
						[flipped ? 'right' : 'left']: 0,
						width: controlWidth,
						height: controlHeight,
						border: `1px solid ${COLORS.hero}`,
						background: 'transparent',
						borderRadius: type === 'radio' ? '50%' : 3,

						// Focus state
						'body:not(.isMouseMode) input:focus + &': {
							outline: `2px solid ${COLORS.focus}`,
							outlineOffset: 3,
						},

						// Disabled state
						'input:disabled + &, fieldset:disabled &': {
							borderColor: COLORS.border,
							backgroundColor: COLORS.light,
						},
					},

					// Control 'check' (tick or dot)
					'::after': {
						content: '""',
						position: 'absolute',
						border: `solid ${COLORS.hero}`,
						opacity: 0, //hide
						top: `calc(((${controlHeight} - ${checkHeight}) / 2) + ${checkTweak})`,
						[flipped ? 'right' : 'left']: `calc((${controlWidth} - ${checkWidth}) / 2)`,
						width: type === 'radio' ? 0 : checkWidth,
						height: type === 'radio' ? 0 : checkHeight,
						borderWidth:
							type === 'radio'
								? `calc(${checkWidth} / 2)`
								: `0 0 ${checkboxStroke} ${checkboxStroke}`,
						borderRadius: type === 'radio' && '50%',
						background: type === 'radio' && COLORS.hero,
						transform: type === 'checkbox' && 'rotate(-54deg)',

						// Fix bug in IE11 caused by transform rotate (-54deg)
						borderTopColor: type === 'checkbox' && 'transparent',

						// Selected state
						'input:checked + &': {
							opacity: 1, //show
						},
					},
				}}
			>
				{children}
			</label>
		</div>
	);
};

// ==============================
// Types
// ==============================

FormCheckOption.propTypes = {
	/**
	 * Form check option value
	 */
	value: PropTypes.string,

	/**
	 * Check the Form check option
	 */
	checked: PropTypes.bool,

	/**
	 * Disable the Form check option
	 */
	disabled: PropTypes.bool,

	/**
	 * Handler to be called on change
	 */
	onChange: PropTypes.func,

	/**
	 * Form check option label text
	 */
	children: PropTypes.string.isRequired,
};

FormCheckOption.defaultProps = {
	checked: false,
	disabled: false,
};
