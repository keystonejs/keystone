/** @jsx jsx */

import { useTheme } from '@keystone-ui/core';
import { VERTICAL_RHYTHM } from './menu';

type MenuGroupTokens = {
	containerTokens: {
		[key: string]: any,
	},
	titleTokens: {
		[key: string]: any,
	}
}

type MenuGroupStyles = {
	containerStyles: {
		[key: string]: any,
	},
	titleStyles: {
		[key: string]: any,
	},
}

export const useMenuGroupTokens = (): MenuGroupTokens => {
	const { spacing, typography, tones } = useTheme();
	return {
		containerTokens: {
			marginTop: spacing[VERTICAL_RHYTHM],
		},
		titleTokens: {
			paddingHorizontal: spacing.large,
			fontWeight: typography.fontWeight.medium,
			lineHeight: typography.leading.looser,
			color: tones.passive.foreground   // palette.text.muted,
		}
	}
}

export const useMenuGroupStyles = ({ tokens }: { tokens: MenuGroupTokens }): MenuGroupStyles => {
	const { containerTokens, titleTokens } = tokens;
	return {
		containerStyles: {
			'&:not(:first-of-type)': {
				marginTop: containerTokens.marginTop,
			}
		},
		titleStyles: {
			color: titleTokens.color,
			fontWeight: titleTokens.fontWeight,
			lineHeight: titleTokens.lineHeight,
			margin: 0,
			paddingLeft: titleTokens.paddingHorizontal,
			paddingRight: titleTokens.paddingHorizontal,
			textTransform: 'uppercase',
		}
	}
}
