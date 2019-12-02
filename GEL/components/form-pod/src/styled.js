/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand, useMediaQuery } from '@westpac/core';

/**
 * FormPodHeader
 */
export const FormPodHeader = ({ align, ...props }) => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				position: 'relative',
				textAlign: align,
				marginBottom: ['1.5rem', null, '1.875rem'],
			})}
			{...props}
		/>
	);
};

/**
 * FormPodHeaderIcon
 */
export const FormPodHeaderIcon = ({ icon: Icon, ...props }) => {
	const { COLORS } = useBrand();
	const mq = useMediaQuery();

	return (
		<Icon
			css={mq({
				position: [null, 'absolute'],
				right: [null, 0],
				bottom: [null, 0],
				display: 'inline-block',
				border: `1px solid ${COLORS.border}`,
				backgroundColor: '#fff',
				borderRadius: '50%',
				width: '4.125rem', //66px
				height: '4.125rem', //66px
				padding: '0.875rem', //14px, assuming a 36px icon
				textAlign: 'center',
				marginBottom: ['0.75rem', '-0.375rem'],
			})}
			size="large"
			{...props}
		/>
	);
};

/**
 * FormPodPreheading
 */
export const FormPodPreheading = ({ tag: Tag, ...props }) => {
	const { COLORS, TYPE } = useBrand();
	const mq = useMediaQuery();

	return (
		<Tag
			css={mq({
				display: [null, null, 'none'],
				color: COLORS.muted,
				margin: '0 0 0.375rem',
				textTransform: 'uppercase',
				fontSize: '0.6875rem',
				...TYPE.bodyFont[700],
			})}
			{...props}
		/>
	);
};

/**
 * FormPodHeading
 */
export const FormPodHeading = ({ tag: Tag, ...props }) => {
	const { TYPE } = useBrand();

	return (
		<Tag
			css={{
				fontSize: ['1.5rem', '1.875rem'],
				margin: 0,
				...TYPE.bodyFont[300],
			}}
			{...props}
		/>
	);
};

/**
 * FormPodActionsPrimary
 */
export const FormPodActionsPrimary = props => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				display: ['flex', 'block'],
				flex: '0 0 auto',
				justifyContent: 'space-between',
				marginLeft: [null, 'auto'], //flex auto-position right
			})}
			{...props}
		/>
	);
};

/**
 * FormPodActionsSecondary
 */
export const FormPodActionsSecondary = props => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				flex: 1,
				marginTop: ['0.75rem', 0],
				marginRight: [null, '1.5rem'],
			})}
			{...props}
		/>
	);
};

/**
 * FormPodContactListItem
 */
export const FormPodContactListItem = ({ item, ...props }) => {
	const { COLORS } = useBrand();
	const mq = useMediaQuery();

	const Icon = item.icon;

	// Set default icon color
	const iconColor = item.iconColor === undefined ? COLORS.primary : item.color;

	return (
		<li css={{ display: 'inline-block' }} {...props}>
			<a
				href={item.url}
				css={{
					display: 'inline-block',
					color: 'inherit',
					textDecoration: 'none',
					verticalAlign: 'middle',
				}}
				onClick={item.onClick}
			>
				{Icon && (
					<Icon
						size="medium"
						css={mq({
							// marginRight: [null, '0.75rem'], //TODO: multiple contact items?
							marginRight: '0.75rem',
						})}
						color={iconColor}
					/>
				)}
				<span
					css={mq({
						// display: ['none', 'inline'], //TODO: multiple contact items?
						verticalAlign: 'middle',
					})}
				>
					{item.text}
				</span>
			</a>
		</li>
	);
};

// ==============================
// Types
// ==============================

/**
 * FormPodHeader
 */
const formPodHeaderOptions = { align: ['left', 'right', 'center'] };
FormPodHeader.propTypes = {
	/**
	 * Header content alignment.
	 */
	align: PropTypes.oneOfType([
		PropTypes.oneOf(formPodHeaderOptions.align),
		PropTypes.arrayOf(PropTypes.oneOf(formPodHeaderOptions.align)),
	]),
};
FormPodHeader.defaultProps = {
	align: 'left',
};

/**
 * FormPodHeaderIcon
 */
FormPodHeaderIcon.propTypes = {
	/**
	 * Header icon
	 */
	icon: PropTypes.func,
};
FormPodHeaderIcon.defaultProps = {};

/**
 * FormPodPreheading
 */
FormPodPreheading.propTypes = {
	/**
	 * The pre-heading tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};
FormPodPreheading.defaultProps = {
	tag: 'p',
};

/**
 * FormPodHeading
 */
FormPodHeading.propTypes = {
	/**
	 * The heading tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};
FormPodHeading.defaultProps = {
	tag: 'h1',
};

/**
 * FormPodContactListItem
 */
FormPodContactListItem.propTypes = {
	/**
	 * The contact list item data
	 */
	item: PropTypes.shape({
		icon: PropTypes.func.isRequired,
		iconColor: PropTypes.string,
		text: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
		onClick: PropTypes.func,
	}),
};
FormPodContactListItem.defaultProps = {};
