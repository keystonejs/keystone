/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';

import { useInputClusterContext } from './InputCluster';

// ==============================
// Component
// ==============================

export const InputClusterItem = props => {
	const { horizontal } = useInputClusterContext();

	return (
		<div
			css={{
				marginRight: horizontal && '1.125rem',
				display: horizontal && 'flex',
				flexDirection: horizontal && 'column',
				justifyContent: horizontal && 'flex-end',

				// Subequent items
				'& + &': {
					marginTop: !horizontal && '1.125rem',
				},
			}}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

InputClusterItem.propTypes = {
	/**
	 * Component children
	 */
	children: PropTypes.node,
};

InputClusterItem.defaultProps = {};
