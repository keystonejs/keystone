/** @jsx jsx */

import { useTheme } from '@keystone-ui/core';

// 1. Avoid focused items intersecting with the menu's border-radius
// 2. Provide consistient spacing between interior elements
export const VERTICAL_RHYTHM = 'medium';

type MenuTokens = {
	paddingVertical: number,
}

type MenuStyles = {
	[key: string]: any,
}

export const useMenuTokens = (): MenuTokens => {
	const { spacing } = useTheme();
	return {
		paddingVertical: spacing.small,
	};
};

export const useMenuStyles = ({ tokens }: { tokens: MenuTokens}): MenuStyles => {
	const { paddingVertical } = tokens;
	return {
		maxHeight: 320,
		minWidth: 220,
		maxWidth: 360,
		overflowY: 'auto',
		paddingBottom: paddingVertical,
		paddingTop: paddingVertical,
		WebkitOverflowScrolling: 'touch',
	};
};
