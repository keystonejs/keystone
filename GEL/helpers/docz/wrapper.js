import React from 'react';
import { GEL } from '@westpac/core';
import defaultBrand from '@westpac/wbc';

export default function({ children }) {
	return (
		<GEL brand={defaultBrand}>
			<style>{`
				.react-live-preview {
					height: 100%;
				}
			`}</style>
			{children}
		</GEL>
	);
}
