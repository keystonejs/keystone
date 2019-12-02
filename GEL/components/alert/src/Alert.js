/** @jsx jsx */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CloseIcon, AlertIcon, InfoIcon, TickIcon } from '@westpac/icon';
import { jsx, useBrand, useMediaQuery, merge } from '@westpac/core';
import { CSSTransition } from 'react-transition-group';
import { Heading } from '@westpac/heading';
import { Button } from '@westpac/button';
import pkg from '../package.json';

// ==============================
// Overwrite component
// ==============================

const CloseBtn = ({ onClose, icon, look, closable, ...rest }) => (
	<Button onClick={() => onClose()} iconAfter={icon} look="link" {...rest} />
);

const BodyHeading = ({ tag, children, closable, ...rest }) => (
	<Heading size={7} tag={tag} {...rest}>
		{children}
	</Heading>
);

// ==============================
// Component
// ==============================

export const Alert = ({ look, closable, icon: Icon, heading, headingTag, children, ...rest }) => {
	const { COLORS, SPACING, [pkg.name]: brandOverrides } = useBrand();
	const mq = useMediaQuery();
	const [open, setOpen] = useState(true);

	const overrides = {
		success: {
			icon: TickIcon,
			css: {
				backgroundColor: COLORS.tints[`${look}5`],
				color: COLORS[look],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		info: {
			icon: InfoIcon,
			css: {
				backgroundColor: COLORS.tints[`${look}5`],
				color: COLORS[look],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		warning: {
			icon: AlertIcon,
			css: {
				backgroundColor: COLORS.tints[`${look}5`],
				color: COLORS[look],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		danger: {
			icon: AlertIcon,
			css: {
				backgroundColor: COLORS.tints[`${look}5`],
				color: COLORS[look],
				borderColor: COLORS.tints[`${look}50`],
			},
		},
		system: {
			icon: AlertIcon,
			css: {
				backgroundColor: COLORS.system,
				color: 'black',
				borderColor: COLORS.system,
			},
		},
		duration: 300,
		innerCSS: {},
		CloseBtn,
		Heading: BodyHeading,
	};
	merge(overrides, brandOverrides);

	// Set a default icon
	if (Icon === undefined) {
		Icon = overrides[look].icon;
	}

	return (
		<CSSTransition in={open} unmountOnExit classNames="anim" timeout={overrides.duration + 100}>
			<div
				css={mq({
					marginBottom: '1.3125rem',
					padding: ['1.125rem', closable ? `1.125rem 1.875rem 1.125rem 1.125rem` : '1.125rem'],
					position: 'relative',
					display: [null, 'flex'],
					zIndex: 1,
					transition: `opacity ${overrides.duration}ms ease-in-out`,
					opacity: 1,
					'&.anim-exit-active': {
						opacity: 0,
					},
					borderTop: '1px solid',
					borderBottom: '1px solid',
					...overrides[look].css,
				})}
				{...rest}
			>
				{closable && (
					<overrides.CloseBtn
						onClose={() => setOpen(false)}
						icon={CloseIcon}
						look={look}
						closable={closable}
						css={mq({
							color: 'inherit',
							position: ['relative', 'absolute'],
							zIndex: 1,
							float: ['right', 'none'],
							top: SPACING(1),
							right: SPACING(1),
							marginTop: ['-1.125rem', 0],
							marginRight: ['-1.125rem', 0],
							opacity: 1,

							':hover': {
								opacity: 0.5,
							},
						})}
					/>
				)}
				{Icon && (
					<Icon
						css={mq({
							float: ['left', 'none'],
							marginRight: ['0.375rem', '0.75rem'],
							flex: 'none',
						})}
						size={['small', 'medium']}
						color="inherit"
					/>
				)}
				<div
					css={mq({
						position: 'relative',
						flex: 1,
						top: [null, Icon && '0.125rem'],
						'& > a, & > h1, & > h2, & > h3, & > h4, & > h5, & > h6, & > ol, & > ul': {
							color: 'inherit',
						},
						...overrides.innerCSS,
					})}
				>
					{heading && (
						<overrides.Heading
							tag={headingTag}
							css={{ marginBottom: SPACING(2) }}
							look={look}
							closable={closable}
						>
							{heading}
						</overrides.Heading>
					)}
					{children}
				</div>
			</div>
		</CSSTransition>
	);
};

// ==============================
// Types
// ==============================

Alert.propTypes = {
	/**
	 * Alert look
	 */
	look: PropTypes.oneOf(['success', 'info', 'warning', 'danger', 'system']).isRequired,

	/**
	 * Enable closable mode
	 */
	closable: PropTypes.bool.isRequired,

	/**
	 * Alert icon.
	 *
	 * The alert icon is automatically rendered based on look, but can be overriden via this prop. Pass a `null` value to remove completely.
	 */
	icon: PropTypes.func,

	/**
	 * The heading
	 */
	heading: PropTypes.string,

	/**
	 * The tag of the heading element for semantic reasons
	 */
	headingTag: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).isRequired,

	/**
	 * Alert children
	 */
	children: PropTypes.node,
};

Alert.defaultProps = {
	look: 'info',
	closable: false,
	headingTag: 'h2',
};
