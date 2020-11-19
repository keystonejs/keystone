/** @jsx jsx */

import { useTheme } from '@keystone-ui/core';
import { VERTICAL_RHYTHM } from './menu';

type MenuDividerTokens = {
	marginVertical: number,
	backgroundColor: string,
}

type MenuDividerStyles = {
	[key: string]: any,
}

export const useMenuDividerTokens = (): MenuDividerTokens => {
	const { spacing } = useTheme();
	return {
		backgroundColor: 'grey',  // TODO palette.global.border,
		marginVertical: spacing[VERTICAL_RHYTHM],
	}
}

export const useMenuDividerStyles = ({ tokens }: { tokens: MenuDividerTokens }): MenuDividerStyles => {
	const { marginVertical, backgroundColor } = tokens;
	return {
		backgroundColor,
		height: 1,
		marginBottom: marginVertical,
		marginTop: marginVertical,
	}
}
