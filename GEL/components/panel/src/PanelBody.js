/** @jsx jsx */

import React from 'react';
import { jsx, useMediaQuery } from '@westpac/core';

// ==============================
// Component
// ==============================

export const PanelBody = props => {
	const mq = useMediaQuery();

	return <div css={mq({ padding: ['0.75rem', '1.5rem'] })} {...props} />;
};
