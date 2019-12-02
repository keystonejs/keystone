/** @jsx jsx */

import { jsx, useMediaQuery, useBrand } from '@westpac/core';
import PropTypes from 'prop-types';

// ==============================
// Component
// ==============================

export const Container = props => {
	const { SPACING } = useBrand();
	const mq = useMediaQuery();

	const padding = [SPACING(2), SPACING(3), SPACING(6), SPACING(8), SPACING(10)];

	return (
		<div
			css={mq({
				marginLeft: 'auto',
				marginRight: 'auto',
				maxWidth: SPACING(352),
				paddingLeft: padding,
				paddingRight: padding,
			})}
			{...props}
		/>
	);
};

Container.propTypes = {};

Container.defaultProps = {};
