import React from 'react';
import PropTypes from 'prop-types';
import { Table } from './';

export const PanelTable = props => (
	<Table
		wrappingStyles={
			props.responsive && {
				marginBottom: '0 !important',
				border: '0 !important',
			}
		}
		{...props}
	/>
);

// ==============================
// Types
// ==============================

PanelTable.propTypes = {
	/**
	 * Striped mode
	 */
	striped: PropTypes.bool,

	/**
	 * Bordered mode
	 */
	bordered: PropTypes.bool,

	/**
	 * Responsive mode
	 */
	responsive: PropTypes.bool,
};

PanelTable.defaultProps = {
	striped: false,
	bordered: false,
	responsive: false,
};
