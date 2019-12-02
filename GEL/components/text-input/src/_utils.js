export const round = f => Math.round(f * 100) / 100; //2DP

export const sizeMap = {
	small: {
		padding: ['0.1875rem', '0.5625rem', '0.25rem'],
		fontSize: '0.875rem',
		textarea: {
			minHeight: '3.375rem',
		},
	},
	medium: {
		padding: ['0.3125rem', '0.75rem'],
		fontSize: '1rem',
		textarea: {
			minHeight: '3.75rem',
		},
	},
	large: {
		padding: ['0.5rem', '0.9375rem'],
		fontSize: '1rem',
		textarea: {
			minHeight: '4.125rem',
		},
	},
	xlarge: {
		padding: ['0.5625rem', '1.125rem', '0.625rem'],
		fontSize: '1.125rem',
		textarea: {
			minHeight: '4.5rem',
		},
	},
};
