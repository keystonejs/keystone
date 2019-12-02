/** @jsx jsx */

import { jsx, useBrand, merge } from '@westpac/core';
import { Text } from '@westpac/text-input';
import { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import pkg from '../package.json';
import { Right } from './Right';
import { Left } from './Left';

// ==============================
// Component
// ==============================

/**
 * Input Group
 */
export const InputGroup = ({
	name,
	size,
	data,
	invalid,
	disabled,
	readOnly,
	children,
	value,
	defaultValue,
	look,
	...props
}) => {
	const { [pkg.name]: overridesWithTokens } = useBrand();

	const overrides = {
		css: {},
		textCSS: {},
		Left,
		Text,
		Right,
	};
	merge(overrides, overridesWithTokens);

	let added = false;
	const childrenWithProps = [];
	const length = Children.count(children);

	if (data) {
		const { left, right } = data;

		if (left) {
			childrenWithProps.push(
				<overrides.Left key="left" look={look} disabled={disabled} size={size} {...left} />
			);
		}
		childrenWithProps.push(
			<overrides.Text
				key="textinput1"
				size={size}
				invalid={invalid}
				disabled={disabled}
				readOnly={readOnly}
				value={value}
				defaultValue={defaultValue}
				name={name}
				css={{
					boxSizing: 'border-box',
					...(left && {
						borderTopLeftRadius: 0,
						borderBottomLeftRadius: 0,
					}),
					...(right && {
						borderTopRightRadius: 0,
						borderBottomRightRadius: 0,
					}),
					...overrides.textCSS,
				}}
			/>
		);
		if (right) {
			childrenWithProps.push(
				<overrides.Right key="right" look={look} disabled={disabled} size={size} {...right} />
			);
		}
	} else {
		Children.map(children, child => {
			if (child.type.name === 'Left' && !added) {
				childrenWithProps.push(cloneElement(child, { look, size, disabled, key: 'left' }));
				childrenWithProps.push(
					<overrides.Text
						key="textinput1"
						size={size}
						invalid={invalid}
						disabled={disabled}
						readOnly={readOnly}
						value={value}
						defaultValue={defaultValue}
						name={name}
						css={{
							boxSizing: 'border-box',
							borderTopLeftRadius: 0,
							borderBottomLeftRadius: 0,
							...(length > 1 && {
								borderTopRightRadius: 0,
								borderBottomRightRadius: 0,
							}),
							...overrides.textCSS,
						}}
					/>
				);
				added = true;
			} else if (child.type.name === 'Right' && !added) {
				childrenWithProps.push(
					<overrides.Text
						key="textinput2"
						size={size}
						invalid={invalid}
						disabled={disabled}
						readOnly={readOnly}
						value={value}
						defaultValue={defaultValue}
						name={name}
						css={{
							boxSizing: 'border-box',
							borderTopRightRadius: 0,
							borderBottomRightRadius: 0,
							...overrides.textCSS,
						}}
					/>
				);
				childrenWithProps.push(cloneElement(child, { look, size, disabled, key: 'right' }));
				added = true;
			} else {
				childrenWithProps.push(cloneElement(child, { look, size, disabled, key: 'other' }));
			}
		});
	}

	return (
		<div css={{ display: 'flex', ...overrides.css }} {...props}>
			{childrenWithProps}
		</div>
	);
};

// ==============================
// Types
// ==============================

InputGroup.propTypes = {
	/**
	 * The name of the input field
	 */
	name: PropTypes.string,

	/**
	 * InputGroup size
	 */
	size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']).isRequired,

	/**
	 * Data driven
	 */
	data: PropTypes.shape({
		left: PropTypes.shape({
			type: PropTypes.oneOf(['label', 'button', 'select']).isRequired,
			data: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
			onClick: PropTypes.func,
		}),
		right: PropTypes.shape({
			type: PropTypes.oneOf(['label', 'button', 'select']).isRequired,
			data: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
			onClick: PropTypes.func,
		}),
	}),

	/**
	 * Invalid input mode
	 */
	invalid: PropTypes.bool.isRequired,

	/**
	 * Disabled input mode
	 */
	disabled: PropTypes.bool.isRequired,

	/**
	 * InputGroup children
	 */
	children: PropTypes.node,
};

InputGroup.defaultProps = {
	size: 'medium',
	invalid: false,
	disabled: false,
};
