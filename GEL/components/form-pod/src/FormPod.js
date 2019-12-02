/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useMediaQuery } from '@westpac/core';
import { FormPodHeader, FormPodHeaderIcon, FormPodPreheading, FormPodHeading } from './styled';

// ==============================
// Component
// ==============================

export const FormPod = ({ icon, preheading, heading, children, ...props }) => {
	const mq = useMediaQuery();

	// Styling to provide the icon gap
	const styleHeaderTextWithIcon = {
		marginRight: [null, '4.125rem'],
		paddingRight: [null, '0.75rem'],
	};

	return (
		<div {...props}>
			<FormPodHeader align={icon && ['center', 'left']}>
				{icon && <FormPodHeaderIcon icon={icon} />}
				{preheading && (
					<FormPodPreheading css={mq(icon && styleHeaderTextWithIcon)}>
						{preheading}
					</FormPodPreheading>
				)}
				{heading && (
					<FormPodHeading css={mq(icon && styleHeaderTextWithIcon)}>{heading}</FormPodHeading>
				)}
			</FormPodHeader>
			{children}
		</div>
	);
};

// ==============================
// Types
// ==============================

FormPod.propTypes = {
	/**
	 * Pre-heading text.
	 *
	 * This text is visible in XS and SM breakpoints only.
	 */
	preheading: PropTypes.string,

	/**
	 * Heading text
	 */
	heading: PropTypes.string,

	/**
	 * Header icon
	 */
	icon: PropTypes.func,

	/**
	 * Component children
	 */
	children: PropTypes.node,
};

FormPod.defaultProps = {};
