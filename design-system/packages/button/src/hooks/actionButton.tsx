/** @jsx jsx */

import { useTheme } from '@keystone-ui/core';

type IconBeforeStyles = {
	[key: string]: any,
}

export const useIconBeforeStyles = (): IconBeforeStyles => {
	const { spacing } = useTheme();
	return {
		marginRight: spacing.small,
	};
};

export const useIconAfterStyles = (): IconBeforeStyles => {
	const { spacing } = useTheme();
	return {
		marginLeft: spacing.small,
	};
};
