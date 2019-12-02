/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';
import { FormPodContactListItem } from './styled';

// ==============================
// Component
// ==============================

export const FormPodContactList = ({ items, ...props }) => (
	<ul
		css={{
			listStyle: 'none',
			paddingLeft: 0,
			margin: 0,

			'li + li': {
				marginLeft: '1.125rem',
			},
		}}
		{...props}
	>
		{(items || []).map((item, i) => (
			<FormPodContactListItem key={i} item={item} />
		))}
	</ul>
);

// ==============================
// Types
// ==============================

FormPodContactList.propTypes = {
	/**
	 * Array of contact detail data (objects)
	 */
	items: PropTypes.arrayOf(
		PropTypes.shape({
			icon: PropTypes.func.isRequired,
			iconColor: PropTypes.string,
			text: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired,
			onClick: PropTypes.func,
		})
	),
};

FormPodContactList.defaultProps = {};
